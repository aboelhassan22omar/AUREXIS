"""Proving that a person signing up controls the phone number they entered.

Ported from SuperAgent's WhatsApp login flow and adapted for Aurexis sign-up:

    browser  POST /auth/whatsapp/start {phone}
             -> poll_secret + a wa.me link whose message carries `nonce`
    user     taps the link; WhatsApp opens with the message typed; user taps send
    Meta     POST /auth/whatsapp/webhook {from: wa_id, text: "... NONCE ..."}
    here     the sender must be the number entered -> reply with a 6-digit code
    browser  polls /status, then POST /verify {poll_secret, code}
    browser  POST /auth/register {..., phone, phone_verification: poll_secret}

The user messages first, so the reply falls inside WhatsApp's 24-hour service window
and no pre-approved message template is needed.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from functools import lru_cache

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.phone_verification import PhoneVerification
from app.models.user import User
from app.services.whatsapp import rules
from app.services.whatsapp.gateway import (
    CloudApiGateway,
    RecordingGateway,
    WhatsAppGateway,
    WhatsAppUnavailable,
)

logger = logging.getLogger(__name__)


PURPOSE_SIGNUP = "signup"
PURPOSE_RESET = "reset"
PURPOSES = (PURPOSE_SIGNUP, PURPOSE_RESET)


class VerificationError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code


@dataclass(frozen=True)
class Started:
    poll_secret: str
    link: str
    message: str
    business_number: str
    expires_at: datetime
    dev_simulate: bool


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


@lru_cache
def get_gateway() -> WhatsAppGateway:
    if settings.WHATSAPP_TOKEN and settings.WHATSAPP_PHONE_NUMBER_ID:
        return CloudApiGateway(
            phone_number_id=settings.WHATSAPP_PHONE_NUMBER_ID,
            access_token=settings.WHATSAPP_TOKEN,
            graph_version=settings.WHATSAPP_GRAPH_VERSION,
        )
    return RecordingGateway(log_bodies=settings.WHATSAPP_LOG_CODES)


def business_number() -> str:
    return rules.normalize_e164(settings.WHATSAPP_NUMBER) or ""


def _say(wa_id: str, text: str) -> None:
    try:
        get_gateway().send_text(wa_id, text)
    except WhatsAppUnavailable as exc:
        logger.warning("Could not reply over WhatsApp: %s", exc)


# -- browser: start ---------------------------------------------------------

def start(db: Session, raw_phone: str, purpose: str = PURPOSE_SIGNUP) -> Started:
    if purpose not in PURPOSES:
        raise VerificationError("bad_purpose", "Unknown verification purpose.", 422)

    phone = rules.normalize_e164(raw_phone)
    if phone is None:
        raise VerificationError(
            "invalid_phone",
            "Enter your number in international form, e.g. +20 128 833 9613.",
            422,
        )

    number = business_number()
    if not number and not settings.WHATSAPP_DEV_SIMULATE:
        raise VerificationError(
            "not_configured",
            "Phone verification is not available right now. Please try again later.",
            503,
        )

    registered = db.scalar(select(User.id).where(User.phone == phone)) is not None

    if purpose == PURPOSE_SIGNUP and registered:
        raise VerificationError("phone_taken", "This phone number is already registered.", 409)

    if purpose == PURPOSE_RESET and not registered:
        raise VerificationError(
            "phone_unknown",
            "No Aurexis account uses this number. Check it, or create an account.",
            404,
        )

    since = _now() - timedelta(minutes=rules.RATE_WINDOW_MINUTES)
    recent = db.scalar(
        select(func.count(PhoneVerification.id)).where(
            PhoneVerification.phone == phone,
            PhoneVerification.created_at >= since,
        )
    )
    if (recent or 0) >= rules.MAX_PER_PHONE:
        raise VerificationError(
            "rate_limited",
            "Too many attempts for this number. Please wait a few minutes.",
            429,
        )

    nonce = rules.new_nonce()
    poll_secret = rules.new_poll_secret()
    expires_at = _now() + timedelta(minutes=settings.WHATSAPP_CHALLENGE_TTL_MINUTES)
    db.add(
        PhoneVerification(
            nonce=nonce,
            poll_secret_hash=rules.hash_secret(poll_secret),
            phone=phone,
            purpose=purpose,
            status=rules.STATUS_PENDING,
            attempts=0,
            expires_at=expires_at,
        )
    )
    db.commit()

    message = rules.prefilled_message(nonce)
    return Started(
        poll_secret=poll_secret,
        link=rules.click_to_chat_link(number, message) if number else "",
        message=message,
        business_number=number,
        expires_at=expires_at,
        dev_simulate=settings.WHATSAPP_DEV_SIMULATE,
    )


# -- webhook: claim ---------------------------------------------------------

def claim(db: Session, *, wa_id: str, body: str, message_id: str) -> str:
    """Handle one inbound message. Never raises (Meta replays failures for days)."""
    try:
        return _claim(db, wa_id=wa_id, body=body, message_id=message_id)
    except Exception:  # noqa: BLE001
        db.rollback()
        logger.exception("WhatsApp claim failed unexpectedly")
        return "error"


def _claim(db: Session, *, wa_id: str, body: str, message_id: str, reply: bool = True) -> str:
    if message_id and db.scalar(
        select(PhoneVerification.id).where(PhoneVerification.message_id == message_id)
    ):
        return "duplicate"

    nonce = rules.extract_nonce(body)
    if nonce is None:
        return "no_nonce"

    challenge = db.scalar(select(PhoneVerification).where(PhoneVerification.nonce == nonce))
    if challenge is None:
        return "unknown_nonce"
    if challenge.status != rules.STATUS_PENDING:
        return "already_claimed"

    def reject(reason: str, text: str | None = None) -> str:
        challenge.status = rules.STATUS_REJECTED
        challenge.reason = reason
        challenge.message_id = message_id or None
        db.commit()
        if text and reply:
            _say(wa_id, text)
        return reason

    if _aware(challenge.expires_at) <= _now():
        return reject("expired", "That verification link has expired. Please start again on the Aurexis website.")

    sender = rules.to_e164(wa_id)
    if sender != challenge.phone:
        # The number that messaged us is not the one entered on the website.
        return reject(
            "phone_mismatch",
            "This WhatsApp number doesn't match the number entered on Aurexis. "
            "Please send the message from the same number you entered.",
        )

    code = rules.new_code()
    challenge.status = rules.STATUS_CODE_SENT
    challenge.code_hash = rules.hash_secret(code)
    challenge.code_sent_at = _now()
    challenge.message_id = message_id or None
    db.commit()

    if not reply:
        return code

    try:
        what = "password reset code" if challenge.purpose == PURPOSE_RESET else "verification code"
        get_gateway().send_text(
            wa_id,
            f"Your Aurexis {what} is {code}. "
            f"It expires in {settings.WHATSAPP_CHALLENGE_TTL_MINUTES} minutes. "
            "Don't share it with anyone.",
        )
    except WhatsAppUnavailable as exc:
        logger.warning("Could not deliver a verification code: %s", exc)
        challenge.status = rules.STATUS_REJECTED
        challenge.reason = "send_failed"
        db.commit()
        return "send_failed"

    return "code_sent"


# -- browser: status, verify -------------------------------------------------

def _by_poll_secret(db: Session, poll_secret: str) -> PhoneVerification:
    challenge = db.scalar(
        select(PhoneVerification).where(
            PhoneVerification.poll_secret_hash == rules.hash_secret(poll_secret or "")
        )
    )
    if challenge is None:
        raise VerificationError("not_found", "Verification not found. Please start again.", 404)
    return challenge


def status(db: Session, poll_secret: str) -> PhoneVerification:
    challenge = _by_poll_secret(db, poll_secret)
    if challenge.status in (rules.STATUS_PENDING, rules.STATUS_CODE_SENT) and _aware(
        challenge.expires_at
    ) <= _now():
        challenge.status = rules.STATUS_REJECTED
        challenge.reason = "expired"
        db.commit()
    return challenge


def verify(db: Session, poll_secret: str, code: str) -> PhoneVerification:
    challenge = _by_poll_secret(db, poll_secret)

    if challenge.status == rules.STATUS_VERIFIED:
        return challenge
    if challenge.status != rules.STATUS_CODE_SENT:
        raise VerificationError("not_ready", "We haven't received your WhatsApp message yet.", 409)
    if _aware(challenge.expires_at) <= _now():
        challenge.status = rules.STATUS_REJECTED
        challenge.reason = "expired"
        db.commit()
        raise VerificationError("expired", "This code has expired. Please start again.", 410)
    if challenge.attempts >= rules.MAX_ATTEMPTS:
        challenge.status = rules.STATUS_REJECTED
        challenge.reason = "too_many_attempts"
        db.commit()
        raise VerificationError("too_many_attempts", "Too many wrong codes. Please start again.", 429)

    # Counted before comparing, so a crash cannot hand out a free guess.
    challenge.attempts += 1
    db.commit()

    if not rules.code_matches(challenge.code_hash, code):
        left = rules.MAX_ATTEMPTS - challenge.attempts
        raise VerificationError(
            "bad_code",
            f"That code isn't right. {left} attempt{'s' if left != 1 else ''} left.",
            400,
        )

    challenge.status = rules.STATUS_VERIFIED
    challenge.verified_at = _now()
    db.commit()
    return challenge


def consume_for_signup(db: Session, poll_secret: str, raw_phone: str) -> str:
    """Spend a verified challenge on one new account. Returns the verified E.164 phone.

    Does not commit: the caller commits it together with the new user.
    """
    return _consume(db, poll_secret, raw_phone, PURPOSE_SIGNUP)


def consume_for_reset(db: Session, poll_secret: str, raw_phone: str) -> str:
    """Spend a verified reset challenge. Returns the verified E.164 phone. No commit."""
    return _consume(db, poll_secret, raw_phone, PURPOSE_RESET)


def _consume(db: Session, poll_secret: str, raw_phone: str, purpose: str) -> str:
    phone = rules.normalize_e164(raw_phone)
    challenge = _by_poll_secret(db, poll_secret)

    if (
        challenge.purpose != purpose
        or challenge.status != rules.STATUS_VERIFIED
        or challenge.consumed_at is not None
        or phone is None
        or challenge.phone != phone
    ):
        raise VerificationError(
            "phone_not_verified", "Please verify your phone number over WhatsApp first.", 400
        )
    if _aware(challenge.expires_at) + timedelta(minutes=30) <= _now():
        raise VerificationError("expired", "Your phone verification expired. Please verify again.", 410)

    challenge.consumed_at = _now()
    return challenge.phone


# -- development only ------------------------------------------------------

def dev_simulate(db: Session, poll_secret: str) -> str:
    """Pretend the user sent the WhatsApp message; return the code to the browser.

    Exists because Meta cannot reach a localhost webhook. Gated by WHATSAPP_DEV_SIMULATE.
    """
    if not settings.WHATSAPP_DEV_SIMULATE:
        raise VerificationError("not_found", "Not found.", 404)

    challenge = _by_poll_secret(db, poll_secret)
    result = _claim(
        db,
        wa_id=rules.wa_id_of(challenge.phone),
        body=rules.prefilled_message(challenge.nonce),
        message_id="",
        reply=False,
    )
    if not result.isdigit():
        raise VerificationError(result, "Simulation failed: " + result, 409)

    logger.warning("DEV SIMULATE: WhatsApp verification code issued without a real message.")
    return result
