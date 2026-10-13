"""Phone-number and challenge rules for WhatsApp verification. No I/O here.

Ported from SuperAgent's identity service (domain/phone.py + domain/challenges.py).

Two secrets, and why:
  * `nonce` goes out in the wa.me link and comes back over WhatsApp.
  * `poll_secret` never leaves the browser that asked; it is stored hashed.
Holding one without the other is worth nothing: a nonce sent from someone else's
phone delivers the code to *their* WhatsApp, and they hold no poll secret.
"""

from __future__ import annotations

import hashlib
import hmac
import re
import secrets
from typing import Final
from urllib.parse import quote

# No I, O, U or lookalike digits: users may have to type it by hand.
NONCE_ALPHABET: Final[str] = "ABCDEFGHJKLMNPQRSTVWXYZ23456789"
NONCE_LENGTH: Final[int] = 8
CODE_DIGITS: Final[int] = 6
MAX_ATTEMPTS: Final[int] = 5
MAX_PER_PHONE: Final[int] = 5
RATE_WINDOW_MINUTES: Final[int] = 15

STATUS_PENDING: Final[str] = "pending"
STATUS_CODE_SENT: Final[str] = "code_sent"
STATUS_VERIFIED: Final[str] = "verified"
STATUS_REJECTED: Final[str] = "rejected"

_E164 = re.compile(r"^\+[1-9]\d{7,14}$")


# -- phone numbers ----------------------------------------------------------

def wa_id_of(phone: str) -> str:
    """WhatsApp's form of a number: digits only, no "+"."""
    return "".join(ch for ch in str(phone) if ch.isdigit())


def to_e164(wa_id: str) -> str:
    digits = wa_id_of(wa_id)
    return f"+{digits}" if digits else ""


def normalize_e164(raw: str) -> str | None:
    """Accept only explicit international form ("+" and country code).

    National spellings like 01288339613 are refused rather than guessed: wa.me reads
    them as a different number and every link would silently fail.
    """
    cleaned = re.sub(r"[\s\-().]", "", str(raw or ""))
    if cleaned.startswith("00"):
        cleaned = "+" + cleaned[2:]
    return cleaned if _E164.fullmatch(cleaned) else None


def click_to_chat_link(business_number: str, message: str) -> str:
    if not wa_id_of(business_number):
        raise ValueError("WHATSAPP_NUMBER is not configured.")
    return f"https://wa.me/{wa_id_of(business_number)}?text={quote(message, safe='')}"


# -- secrets ----------------------------------------------------------------

def hash_secret(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def new_nonce() -> str:
    return "".join(secrets.choice(NONCE_ALPHABET) for _ in range(NONCE_LENGTH))


def new_code() -> str:
    return f"{secrets.randbelow(10**CODE_DIGITS):0{CODE_DIGITS}d}"


def new_poll_secret() -> str:
    return secrets.token_urlsafe(32)


def code_matches(code_hash: str | None, submitted: str) -> bool:
    if not code_hash:
        return False
    return hmac.compare_digest(code_hash, hash_secret(str(submitted).strip()))


# -- the message ------------------------------------------------------------

def prefilled_message(nonce: str) -> str:
    return f"AUREXIS VERIFY: {nonce}"


def extract_nonce(body: str) -> str | None:
    """Find an exact-length nonce anywhere in what the user sent."""
    if not body:
        return None
    candidates: list[str] = []
    current: list[str] = []
    for ch in body.upper():
        if ch in NONCE_ALPHABET:
            current.append(ch)
            continue
        if len(current) >= NONCE_LENGTH:
            candidates.append("".join(current))
        current = []
    if len(current) >= NONCE_LENGTH:
        candidates.append("".join(current))
    for candidate in candidates:
        if len(candidate) == NONCE_LENGTH:
            return candidate
    return None
