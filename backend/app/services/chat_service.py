from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import re
from uuid import uuid4

from sqlalchemy import (
    func,
    or_,
    select,
    update,
)
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.chat import (
    ChatConversation,
    ChatMessage,
)
from app.schemas.chat import ChatStreamRequest
from app.services.aurexis_scope import (
    decide_scope,
    out_of_scope_response,
)
from app.services.company_knowledge_service import (
    build_company_knowledge,
)
from app.services.llm_provider import build_provider_messages


class ChatServiceError(Exception):
    pass


class ChatNotFoundError(ChatServiceError):
    pass


class ChatConflictError(ChatServiceError):
    pass


class ChatRateLimitError(ChatServiceError):
    pass


@dataclass(slots=True)
class PreparedGeneration:
    conversation_id: int
    generation_token: str
    user_message: ChatMessage
    provider_messages: list[dict[str, str]]
    direct_response: str | None = None


def build_conversation_title(
    content: str,
) -> str:
    normalized = re.sub(
        r"\s+",
        " ",
        content,
    ).strip()

    if not normalized:
        return "New chat"

    limit = 64

    if len(normalized) <= limit:
        return normalized

    shortened = normalized[:limit].rstrip()
    last_space = shortened.rfind(" ")

    if last_space >= 36:
        shortened = shortened[:last_space]

    return f"{shortened}…"


def create_conversation(
    db: Session,
    user_id: int,
) -> ChatConversation:
    conversation = ChatConversation(
        user_id=user_id,
        title="New chat",
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def list_conversations(
    db: Session,
    user_id: int,
    *,
    limit: int = 50,
    offset: int = 0,
) -> list[ChatConversation]:
    statement = (
        select(ChatConversation)
        .where(
            ChatConversation.user_id == user_id
        )
        .order_by(
            ChatConversation.updated_at.desc(),
            ChatConversation.id.desc(),
        )
        .limit(limit)
        .offset(offset)
    )

    return list(
        db.scalars(statement).all()
    )


def get_owned_conversation(
    db: Session,
    user_id: int,
    conversation_id: int,
    *,
    include_messages: bool = False,
) -> ChatConversation | None:
    statement = select(
        ChatConversation
    ).where(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == user_id,
    )

    if include_messages:
        statement = statement.options(
            selectinload(
                ChatConversation.messages
            )
        )

    return db.scalar(statement)


def get_conversation_or_raise(
    db: Session,
    user_id: int,
    conversation_id: int,
    *,
    include_messages: bool = False,
) -> ChatConversation:
    conversation = get_owned_conversation(
        db,
        user_id,
        conversation_id,
        include_messages=include_messages,
    )

    if conversation is None:
        raise ChatNotFoundError(
            "Conversation not found"
        )

    return conversation


def delete_conversation(
    db: Session,
    user_id: int,
    conversation_id: int,
) -> None:
    conversation = get_conversation_or_raise(
        db,
        user_id,
        conversation_id,
    )

    db.delete(conversation)
    db.commit()


def _enforce_rate_limit(
    db: Session,
    user_id: int,
) -> None:
    limit = settings.CHAT_RATE_LIMIT_PER_MINUTE

    if limit <= 0:
        return

    cutoff = datetime.now(
        timezone.utc
    ) - timedelta(minutes=1)

    statement = (
        select(func.count(ChatMessage.id))
        .join(
            ChatConversation,
            ChatConversation.id
            == ChatMessage.conversation_id,
        )
        .where(
            ChatConversation.user_id == user_id,
            ChatMessage.role == "user",
            ChatMessage.created_at >= cutoff,
        )
    )

    count = int(
        db.scalar(statement) or 0
    )

    if count >= limit:
        raise ChatRateLimitError(
            "Too many chat messages. Please wait a moment and try again."
        )


def _reserve_generation(
    db: Session,
    user_id: int,
    conversation_id: int,
) -> str:
    token = str(uuid4())
    now = datetime.now(timezone.utc)
    stale_before = now - timedelta(
        minutes=5
    )

    statement = (
        update(ChatConversation)
        .where(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == user_id,
            or_(
                ChatConversation.generation_token.is_(
                    None
                ),
                ChatConversation.generation_started_at.is_(
                    None
                ),
                ChatConversation.generation_started_at
                < stale_before,
            ),
        )
        .values(
            generation_token=token,
            generation_started_at=now,
        )
    )

    result = db.execute(statement)
    db.commit()

    if result.rowcount != 1:
        raise ChatConflictError(
            "A response is already being generated for this conversation"
        )

    return token


def release_generation(
    db: Session,
    conversation_id: int,
    generation_token: str,
) -> None:
    statement = (
        update(ChatConversation)
        .where(
            ChatConversation.id == conversation_id,
            ChatConversation.generation_token
            == generation_token,
        )
        .values(
            generation_token=None,
            generation_started_at=None,
        )
    )

    db.execute(statement)
    db.commit()


def _latest_message(
    db: Session,
    conversation_id: int,
) -> ChatMessage | None:
    statement = (
        select(ChatMessage)
        .where(
            ChatMessage.conversation_id
            == conversation_id
        )
        .order_by(ChatMessage.id.desc())
        .limit(1)
    )

    return db.scalar(statement)


def _retry_message(
    db: Session,
    conversation_id: int,
    retry_message_id: int,
) -> ChatMessage:
    message = db.scalar(
        select(ChatMessage).where(
            ChatMessage.id == retry_message_id,
            ChatMessage.conversation_id
            == conversation_id,
            ChatMessage.role == "user",
        )
    )

    latest = _latest_message(
        db,
        conversation_id,
    )

    if (
        message is None
        or latest is None
        or latest.id != message.id
    ):
        raise ChatConflictError(
            "Only the latest unanswered user message can be retried"
        )

    return message


def _create_user_message(
    db: Session,
    conversation: ChatConversation,
    content: str,
) -> ChatMessage:
    normalized = content.strip()

    if not normalized:
        raise ChatConflictError(
            "Message cannot be empty"
        )

    if len(normalized) > settings.CHAT_MAX_MESSAGE_CHARS:
        raise ChatConflictError(
            "Message is too long"
        )

    user_message = ChatMessage(
        conversation_id=conversation.id,
        role="user",
        content=normalized,
    )

    if conversation.title == "New chat":
        conversation.title = (
            build_conversation_title(
                normalized
            )
        )

    conversation.updated_at = (
        datetime.now(timezone.utc)
    )

    db.add(user_message)
    db.add(conversation)
    db.commit()
    db.refresh(user_message)

    return user_message


def _recent_history(
    db: Session,
    conversation_id: int,
) -> list[tuple[str, str]]:
    statement = (
        select(ChatMessage)
        .where(
            ChatMessage.conversation_id
            == conversation_id
        )
        .order_by(ChatMessage.id.desc())
        .limit(
            settings.CHAT_CONTEXT_MESSAGES
        )
    )

    recent = list(
        db.scalars(statement).all()
    )
    recent.reverse()

    return [
        (message.role, message.content)
        for message in recent
        if message.role in {"user", "assistant"}
    ]


def prepare_generation(
    db: Session,
    user_id: int,
    conversation_id: int,
    data: ChatStreamRequest,
) -> PreparedGeneration:
    conversation = get_conversation_or_raise(
        db,
        user_id,
        conversation_id,
    )

    generation_token = _reserve_generation(
        db,
        user_id,
        conversation_id,
    )

    try:
        if data.retry_message_id is not None:
            user_message = _retry_message(
                db,
                conversation_id,
                data.retry_message_id,
            )
        else:
            _enforce_rate_limit(
                db,
                user_id,
            )

            user_message = _create_user_message(
                db,
                conversation,
                data.content or "",
            )

        history = _recent_history(
            db,
            conversation_id,
        )
        knowledge = build_company_knowledge(db)

        prior_history = history
        if (
            history
            and history[-1][0] == "user"
            and history[-1][1].strip()
            == user_message.content.strip()
        ):
            prior_history = history[:-1]

        decision = decide_scope(
            user_message.content,
            history=prior_history,
            knowledge=knowledge,
        )

        direct_response = (
            None
            if decision.allowed
            else out_of_scope_response(
                user_message.content
            )
        )

        provider_messages = (
            build_provider_messages(
                history,
                knowledge.context,
            )
            if decision.allowed
            else []
        )
    except Exception:
        release_generation(
            db,
            conversation_id,
            generation_token,
        )
        raise

    return PreparedGeneration(
        conversation_id=conversation_id,
        generation_token=generation_token,
        user_message=user_message,
        provider_messages=provider_messages,
        direct_response=direct_response,
    )


def complete_generation(
    db: Session,
    user_id: int,
    prepared: PreparedGeneration,
    assistant_content: str,
) -> ChatMessage:
    content = assistant_content.strip()

    if not content:
        raise ChatConflictError(
            "Assistant response cannot be empty"
        )

    conversation = get_conversation_or_raise(
        db,
        user_id,
        prepared.conversation_id,
    )

    if (
        conversation.generation_token
        != prepared.generation_token
    ):
        raise ChatConflictError(
            "Generation state is no longer valid"
        )

    assistant_message = ChatMessage(
        conversation_id=prepared.conversation_id,
        role="assistant",
        content=content,
    )

    conversation.updated_at = (
        datetime.now(timezone.utc)
    )
    conversation.generation_token = None
    conversation.generation_started_at = None

    db.add(assistant_message)
    db.add(conversation)
    db.commit()
    db.refresh(assistant_message)

    return assistant_message
