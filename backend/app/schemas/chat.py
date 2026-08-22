from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


MAX_CHAT_MESSAGE_CHARS = 8000
MAX_GUEST_HISTORY_MESSAGES = 20


class ChatMessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ChatConversationSummary(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ChatConversationDetail(ChatConversationSummary):
    messages: list[ChatMessageResponse]


class ChatSendMessageRequest(BaseModel):
    content: str = Field(
        min_length=1,
        max_length=MAX_CHAT_MESSAGE_CHARS,
    )


class ChatStreamRequest(BaseModel):
    content: str | None = Field(
        default=None,
        min_length=1,
        max_length=MAX_CHAT_MESSAGE_CHARS,
    )

    retry_message_id: int | None = Field(
        default=None,
        gt=0,
    )

    @model_validator(mode="after")
    def validate_message_source(
        self,
    ) -> "ChatStreamRequest":
        has_content = bool(
            self.content and self.content.strip()
        )
        has_retry = (
            self.retry_message_id is not None
        )

        if has_content == has_retry:
            raise ValueError(
                "Provide either content or retry_message_id"
            )

        return self


class GuestChatHistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(
        min_length=1,
        max_length=MAX_CHAT_MESSAGE_CHARS,
    )


class GuestChatStreamRequest(BaseModel):
    content: str = Field(
        min_length=1,
        max_length=MAX_CHAT_MESSAGE_CHARS,
    )
    history: list[GuestChatHistoryMessage] = Field(
        default_factory=list,
        max_length=MAX_GUEST_HISTORY_MESSAGES,
    )

    @model_validator(mode="after")
    def normalize_history(
        self,
    ) -> "GuestChatStreamRequest":
        self.content = self.content.strip()

        if not self.content:
            raise ValueError("Message cannot be empty")

        normalized: list[GuestChatHistoryMessage] = []

        for item in self.history:
            content = item.content.strip()
            if not content:
                continue
            normalized.append(
                GuestChatHistoryMessage(
                    role=item.role,
                    content=content,
                )
            )

        self.history = normalized[-MAX_GUEST_HISTORY_MESSAGES:]
        return self


class ChatSendMessageResponse(BaseModel):
    user_message: ChatMessageResponse
    assistant_message: ChatMessageResponse


class ChatDeleteResponse(BaseModel):
    message: str
