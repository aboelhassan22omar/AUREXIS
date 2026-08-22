import os

os.environ.setdefault(
    "DATABASE_URL",
    "sqlite+pysqlite:///:memory:",
)
os.environ.setdefault(
    "JWT_SECRET_KEY",
    "test-secret-key",
)

import pytest
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.chat import ChatConversation
from app.models.user import User
from app.schemas.chat import ChatStreamRequest
from app.services.chat_service import (
    build_conversation_title,
    get_owned_conversation,
)


def test_chat_title_is_normalized_and_limited():
    title = build_conversation_title(
        "  Build   an AUREXIS assistant\nfor our support team "
    )

    assert title == (
        "Build an AUREXIS assistant for our support team"
    )

    long_title = build_conversation_title(
        "word " * 40
    )

    assert len(long_title) <= 65
    assert long_title.endswith("…")


def test_stream_request_requires_one_message_source():
    with pytest.raises(ValidationError):
        ChatStreamRequest()

    with pytest.raises(ValidationError):
        ChatStreamRequest(
            content="hello",
            retry_message_id=1,
        )

    assert (
        ChatStreamRequest(
            content="hello"
        ).content
        == "hello"
    )


def test_conversation_lookup_is_scoped_to_owner():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:"
    )

    Base.metadata.create_all(engine)

    with Session(engine) as db:
        owner = User(
            full_name="Owner User",
            email="owner@example.com",
            hashed_password="test",
            is_active=True,
            is_admin=False,
        )
        other = User(
            full_name="Other User",
            email="other@example.com",
            hashed_password="test",
            is_active=True,
            is_admin=False,
        )

        db.add_all([owner, other])
        db.commit()
        db.refresh(owner)
        db.refresh(other)

        conversation = ChatConversation(
            user_id=owner.id,
            title="Private chat",
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        assert (
            get_owned_conversation(
                db,
                owner.id,
                conversation.id,
            )
            is not None
        )

        assert (
            get_owned_conversation(
                db,
                other.id,
                conversation.id,
            )
            is None
        )


def test_openai_compatible_provider_complete_and_stream(monkeypatch):
    import json
    import threading
    from http.server import BaseHTTPRequestHandler, HTTPServer

    from app.core.config import settings
    from app.services.llm_provider import OpenAICompatibleProvider

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            length = int(self.headers.get("content-length", "0"))
            payload = json.loads(self.rfile.read(length))

            if payload.get("stream"):
                body = (
                    "data: "
                    + json.dumps({"choices": [{"delta": {"content": "Hello"}}]})
                    + "\n\n"
                    + "data: "
                    + json.dumps({"choices": [{"delta": {"content": " world"}}]})
                    + "\n\n"
                    + "data: [DONE]\n\n"
                ).encode("utf-8")

                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return

            body = json.dumps(
                {"choices": [{"message": {"content": "Hello world"}}]}
            ).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, format, *args):
            return

    server = HTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    monkeypatch.setattr(settings, "CHAT_API_KEY", "test-key")
    monkeypatch.setattr(
        settings,
        "CHAT_BASE_URL",
        f"http://127.0.0.1:{server.server_port}/v1",
    )
    monkeypatch.setattr(settings, "CHAT_MODEL", "test-model")

    try:
        provider = OpenAICompatibleProvider()
        messages = [{"role": "user", "content": "hello"}]

        assert provider.complete(messages) == "Hello world"
        assert "".join(provider.stream(messages)) == "Hello world"
    finally:
        server.shutdown()
        thread.join(timeout=2)
