from collections.abc import Iterator
from datetime import datetime, timezone
import json
from typing import Annotated

from fastapi import (
    APIRouter,
    Header,
    HTTPException,
    Query,
    Request,
    status,
)
from fastapi.responses import StreamingResponse

from app.api.deps import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.db.session import SessionLocal
from app.schemas.chat import (
    ChatConversationDetail,
    ChatConversationSummary,
    ChatDeleteResponse,
    ChatMessageResponse,
    ChatSendMessageRequest,
    ChatSendMessageResponse,
    ChatStreamRequest,
    GuestChatStreamRequest,
)
from app.services.aurexis_scope import (
    decide_scope,
    out_of_scope_response,
)
from app.services.chat_service import (
    ChatConflictError,
    ChatNotFoundError,
    ChatRateLimitError,
    complete_generation,
    create_conversation,
    delete_conversation,
    get_conversation_or_raise,
    list_conversations,
    prepare_generation,
    release_generation,
)
from app.services.company_knowledge_service import (
    build_company_knowledge,
)
from app.services.guest_rate_limit import (
    enforce_guest_rate_limit,
)
from app.services.llm_provider import (
    LLMConfigurationError,
    LLMProviderError,
    LLMRateLimitError,
    LLMUnavailableError,
    build_provider_messages,
    get_llm_provider,
)


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


def _not_found(
    exc: Exception,
) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Conversation not found",
    )


def _service_exception(
    exc: Exception,
) -> HTTPException:
    if isinstance(exc, ChatNotFoundError):
        return _not_found(exc)

    if isinstance(exc, ChatRateLimitError):
        return HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc),
        )

    if isinstance(exc, ChatConflictError):
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )

    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unable to process chat request",
    )


def _provider_exception(
    exc: LLMProviderError,
) -> HTTPException:
    if isinstance(exc, LLMRateLimitError):
        return HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI provider is busy. Please try again shortly.",
        )

    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=(
            "AUREXIS AI is not configured yet."
            if isinstance(
                exc,
                LLMConfigurationError,
            )
            else "AUREXIS AI is temporarily unavailable."
        ),
    )


def _event(
    event_type: str,
    **payload,
) -> str:
    return (
        json.dumps(
            {
                "type": event_type,
                **payload,
            },
            ensure_ascii=False,
        )
        + "\n"
    )


def _stream_headers() -> dict[str, str]:
    return {
        "Cache-Control": "no-store, no-cache, no-transform",
        "Pragma": "no-cache",
        "X-Accel-Buffering": "no",
    }


@router.post(
    "/conversations",
    response_model=ChatConversationSummary,
    status_code=status.HTTP_201_CREATED,
)
def create_chat_conversation(
    db: DatabaseDependency,
    current_user: CurrentUserDependency,
) -> ChatConversationSummary:
    conversation = create_conversation(
        db,
        current_user.id,
    )

    return ChatConversationSummary.model_validate(
        conversation
    )


@router.get(
    "/conversations",
    response_model=list[ChatConversationSummary],
)
def get_chat_conversations(
    db: DatabaseDependency,
    current_user: CurrentUserDependency,
    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
) -> list[ChatConversationSummary]:
    conversations = list_conversations(
        db,
        current_user.id,
        limit=limit,
        offset=offset,
    )

    return [
        ChatConversationSummary.model_validate(
            conversation
        )
        for conversation in conversations
    ]


@router.get(
    "/conversations/{conversation_id}",
    response_model=ChatConversationDetail,
)
def get_chat_conversation(
    conversation_id: int,
    db: DatabaseDependency,
    current_user: CurrentUserDependency,
) -> ChatConversationDetail:
    try:
        conversation = get_conversation_or_raise(
            db,
            current_user.id,
            conversation_id,
            include_messages=True,
        )
    except ChatNotFoundError as exc:
        raise _not_found(exc) from exc

    return ChatConversationDetail.model_validate(
        conversation
    )


@router.delete(
    "/conversations/{conversation_id}",
    response_model=ChatDeleteResponse,
)
def delete_chat_conversation(
    conversation_id: int,
    db: DatabaseDependency,
    current_user: CurrentUserDependency,
) -> ChatDeleteResponse:
    try:
        delete_conversation(
            db,
            current_user.id,
            conversation_id,
        )
    except ChatNotFoundError as exc:
        raise _not_found(exc) from exc

    return ChatDeleteResponse(
        message="Conversation deleted"
    )


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=ChatSendMessageResponse,
)
def send_chat_message(
    conversation_id: int,
    data: ChatSendMessageRequest,
    db: DatabaseDependency,
    current_user: CurrentUserDependency,
) -> ChatSendMessageResponse:
    try:
        prepared = prepare_generation(
            db,
            current_user.id,
            conversation_id,
            ChatStreamRequest(
                content=data.content
            ),
        )
    except (
        ChatNotFoundError,
        ChatRateLimitError,
        ChatConflictError,
    ) as exc:
        raise _service_exception(exc) from exc

    try:
        if prepared.direct_response is not None:
            assistant_content = prepared.direct_response
        else:
            try:
                provider = get_llm_provider()
            except LLMProviderError as exc:
                release_generation(
                    db,
                    prepared.conversation_id,
                    prepared.generation_token,
                )
                raise _provider_exception(exc) from exc

            assistant_content = provider.complete(
                prepared.provider_messages
            )

        assistant_message = complete_generation(
            db,
            current_user.id,
            prepared,
            assistant_content,
        )
    except LLMProviderError as exc:
        release_generation(
            db,
            prepared.conversation_id,
            prepared.generation_token,
        )
        raise _provider_exception(exc) from exc
    except ChatConflictError as exc:
        release_generation(
            db,
            prepared.conversation_id,
            prepared.generation_token,
        )
        raise _service_exception(exc) from exc

    return ChatSendMessageResponse(
        user_message=ChatMessageResponse.model_validate(
            prepared.user_message
        ),
        assistant_message=ChatMessageResponse.model_validate(
            assistant_message
        ),
    )


@router.post(
    "/conversations/{conversation_id}/stream",
)
def stream_chat_message(
    conversation_id: int,
    data: ChatStreamRequest,
    db: DatabaseDependency,
    current_user: CurrentUserDependency,
):
    try:
        prepared = prepare_generation(
            db,
            current_user.id,
            conversation_id,
            data,
        )
    except (
        ChatNotFoundError,
        ChatRateLimitError,
        ChatConflictError,
    ) as exc:
        raise _service_exception(exc) from exc

    provider = None
    if prepared.direct_response is None:
        try:
            provider = get_llm_provider()
        except LLMProviderError as exc:
            release_generation(
                db,
                prepared.conversation_id,
                prepared.generation_token,
            )
            raise _provider_exception(exc) from exc

    user_id = current_user.id

    def generate() -> Iterator[str]:
        parts: list[str] = []
        completed = False

        user_payload = (
            ChatMessageResponse.model_validate(
                prepared.user_message
            ).model_dump(mode="json")
        )

        yield _event(
            "message_start",
            user_message=user_payload,
        )

        try:
            if prepared.direct_response is not None:
                parts.append(prepared.direct_response)
                yield _event(
                    "token",
                    content=prepared.direct_response,
                )
            else:
                assert provider is not None
                for token in provider.stream(
                    prepared.provider_messages
                ):
                    parts.append(token)
                    yield _event(
                        "token",
                        content=token,
                    )

            assistant_content = "".join(parts).strip()

            with SessionLocal() as stream_db:
                assistant_message = complete_generation(
                    stream_db,
                    user_id,
                    prepared,
                    assistant_content,
                )

            completed = True

            assistant_payload = (
                ChatMessageResponse.model_validate(
                    assistant_message
                ).model_dump(mode="json")
            )

            yield _event(
                "message_end",
                assistant_message=assistant_payload,
            )
        except GeneratorExit:
            raise
        except LLMRateLimitError:
            yield _event(
                "error",
                code="rate_limited",
                message=(
                    "AUREXIS AI is busy right now. Please retry shortly."
                ),
                retryable=True,
            )
        except LLMConfigurationError:
            yield _event(
                "error",
                code="provider_unavailable",
                message="AUREXIS AI is not configured yet.",
                retryable=True,
            )
        except (
            LLMUnavailableError,
            ChatConflictError,
        ):
            yield _event(
                "error",
                code="provider_unavailable",
                message=(
                    "AUREXIS AI is temporarily unavailable. Please retry."
                ),
                retryable=True,
            )
        except Exception:
            yield _event(
                "error",
                code="server_error",
                message=(
                    "The response could not be completed. Please retry."
                ),
                retryable=True,
            )
        finally:
            if not completed:
                with SessionLocal() as cleanup_db:
                    release_generation(
                        cleanup_db,
                        prepared.conversation_id,
                        prepared.generation_token,
                    )

    return StreamingResponse(
        generate(),
        media_type="application/x-ndjson",
        headers=_stream_headers(),
    )


@router.post("/guest/stream")
def stream_guest_chat_message(
    data: GuestChatStreamRequest,
    request: Request,
    db: DatabaseDependency,
    x_aurexis_guest_session: Annotated[
        str | None,
        Header(alias="X-AUREXIS-Guest-Session"),
    ] = None,
):
    try:
        enforce_guest_rate_limit(
            request,
            x_aurexis_guest_session,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc),
        ) from exc

    history = [
        (item.role, item.content)
        for item in data.history
    ]
    knowledge = build_company_knowledge(db)
    decision = decide_scope(
        data.content,
        history=history,
        knowledge=knowledge,
    )

    direct_response = (
        None
        if decision.allowed
        else out_of_scope_response(data.content)
    )

    provider = None
    provider_messages: list[dict[str, str]] = []

    if direct_response is None:
        provider_messages = build_provider_messages(
            [
                *history,
                ("user", data.content),
            ],
            knowledge.context,
        )
        try:
            provider = get_llm_provider()
        except LLMProviderError as exc:
            raise _provider_exception(exc) from exc

    def generate_guest() -> Iterator[str]:
        parts: list[str] = []
        created_at = datetime.now(
            timezone.utc
        ).isoformat()

        yield _event(
            "message_start",
            guest=True,
        )

        try:
            if direct_response is not None:
                parts.append(direct_response)
                yield _event(
                    "token",
                    content=direct_response,
                )
            else:
                assert provider is not None
                for token in provider.stream(
                    provider_messages
                ):
                    parts.append(token)
                    yield _event(
                        "token",
                        content=token,
                    )

            content = "".join(parts).strip()
            if not content:
                raise LLMUnavailableError(
                    "AI provider returned an empty response"
                )

            yield _event(
                "message_end",
                guest=True,
                assistant_message={
                    "id": -1,
                    "conversation_id": 0,
                    "role": "assistant",
                    "content": content,
                    "created_at": created_at,
                },
            )
        except GeneratorExit:
            raise
        except LLMRateLimitError:
            yield _event(
                "error",
                code="rate_limited",
                message=(
                    "AUREXIS AI is busy right now. Please retry shortly."
                ),
                retryable=True,
            )
        except LLMConfigurationError:
            yield _event(
                "error",
                code="provider_unavailable",
                message="AUREXIS AI is not configured yet.",
                retryable=True,
            )
        except LLMUnavailableError:
            yield _event(
                "error",
                code="provider_unavailable",
                message=(
                    "AUREXIS AI is temporarily unavailable. Please retry."
                ),
                retryable=True,
            )
        except Exception:
            yield _event(
                "error",
                code="server_error",
                message=(
                    "The response could not be completed. Please retry."
                ),
                retryable=True,
            )

    return StreamingResponse(
        generate_guest(),
        media_type="application/x-ndjson",
        headers=_stream_headers(),
    )
