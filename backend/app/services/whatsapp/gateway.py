"""Sending a WhatsApp text: Meta's Cloud API, or a recording fake when unconfigured.

Ported from SuperAgent's identity service (infrastructure/whatsapp/gateways.py),
using the standard library so the backend needs no extra dependency.
"""

from __future__ import annotations

import json
import logging
from typing import Protocol
from urllib import error, request
from urllib.parse import quote

from app.services.whatsapp.rules import wa_id_of

logger = logging.getLogger(__name__)

_GRAPH_HOST = "https://graph.facebook.com"

# Meta's error codes and what each one means for this deployment.
_DIAGNOSES = {
    "190": " — access token expired/revoked. Dashboard tokens last <24h; use a System User token.",
    "131030": " — recipient not on the app's allowed list (development mode).",
    "131047": " — 24h service window closed; only templates may be sent.",
    "131056": " — too many messages to this number too quickly.",
    "100": " — bad parameter, usually WHATSAPP_PHONE_NUMBER_ID (use the ID, not the number).",
    "133010": " — the sending number is not registered on Cloud API.",
    "80007": " — the account hit its rate limit.",
}


class WhatsAppUnavailable(Exception):
    pass


class WhatsAppGateway(Protocol):
    def send_text(self, to: str, body: str) -> None: ...


class CloudApiGateway:
    """One POST, no retries: a late or duplicated code is worse than a clean failure."""

    TIMEOUT_SECONDS = 8.0

    def __init__(self, *, phone_number_id: str, access_token: str, graph_version: str) -> None:
        self._phone_number_id = phone_number_id
        self._token = access_token
        self._version = graph_version

    def send_text(self, to: str, body: str) -> None:
        url = f"{_GRAPH_HOST}/{self._version}/{quote(self._phone_number_id, safe='')}/messages"
        payload = json.dumps(
            {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": wa_id_of(to),
                "type": "text",
                # never let a security code render a link preview
                "text": {"preview_url": False, "body": body},
            }
        ).encode("utf-8")
        req = request.Request(
            url,
            data=payload,
            method="POST",
            headers={
                "Authorization": f"Bearer {self._token}",
                "Content-Type": "application/json",
            },
        )
        try:
            with request.urlopen(req, timeout=self.TIMEOUT_SECONDS):
                return
        except error.HTTPError as exc:
            code = _error_code(exc)
            logger.warning(
                "WhatsApp refused a send: status=%s code=%s%s",
                exc.code,
                code,
                _DIAGNOSES.get(code, " — token rejected" if exc.code in (401, 403) else ""),
            )
            raise WhatsAppUnavailable(f"WhatsApp refused the message ({exc.code}).") from exc
        except (error.URLError, TimeoutError, OSError) as exc:
            raise WhatsAppUnavailable(f"WhatsApp could not be reached: {exc}") from exc


class RecordingGateway:
    """Used when no token is configured: keeps messages instead of sending them."""

    def __init__(self, *, log_bodies: bool = False) -> None:
        self.sent: list[tuple[str, str]] = []
        self._log_bodies = log_bodies

    def send_text(self, to: str, body: str) -> None:
        self.sent.append((wa_id_of(to), body))
        if self._log_bodies:
            logger.warning(
                "WhatsApp not configured; message for %s (dev only): %s", wa_id_of(to), body
            )
        else:
            logger.warning("WhatsApp not configured; a message for %s was discarded.", wa_id_of(to))


def _error_code(exc: error.HTTPError) -> str:
    try:
        body = json.loads(exc.read().decode("utf-8"))
        err = body.get("error") if isinstance(body, dict) else None
        return str(err.get("code", "")) if isinstance(err, dict) else ""
    except Exception:  # noqa: BLE001 - never fail while reporting a failure
        return ""
