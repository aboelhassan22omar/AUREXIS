"""Reading Meta's webhook: the signature and the text messages. Must never raise.

Ported from SuperAgent's identity service (infrastructure/whatsapp/inbound.py).
"""

from __future__ import annotations

import hashlib
import hmac
import json
from dataclasses import dataclass


def signature_is_valid(*, raw_body: bytes, header: str | None, app_secret: str) -> bool:
    """Did Meta sign these exact bytes? Must be the raw body, never re-serialised JSON."""
    if not header or not header.startswith("sha256="):
        return False
    expected = hmac.new(app_secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header[len("sha256="):].strip())


@dataclass(frozen=True, slots=True)
class InboundMessage:
    wa_id: str
    text: str
    message_id: str


def inbound_text_messages(raw_body: bytes) -> list[InboundMessage]:
    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception:  # noqa: BLE001
        return []
    if not isinstance(payload, dict):
        return []

    found: list[InboundMessage] = []
    for entry in _list(payload.get("entry")):
        for change in _list(entry.get("changes") if isinstance(entry, dict) else None):
            value = change.get("value") if isinstance(change, dict) else None
            if not isinstance(value, dict):
                continue
            for message in _list(value.get("messages")):
                if not isinstance(message, dict) or message.get("type") != "text":
                    continue
                text = message.get("text")
                body = text.get("body", "") if isinstance(text, dict) else ""
                # `from` comes from Meta, never from the browser: the basis for trust.
                sender = str(message.get("from") or "")
                if sender:
                    found.append(
                        InboundMessage(
                            wa_id=sender,
                            text=str(body or ""),
                            message_id=str(message.get("id") or ""),
                        )
                    )
    return found


def _list(value: object) -> list:
    return value if isinstance(value, list) else []
