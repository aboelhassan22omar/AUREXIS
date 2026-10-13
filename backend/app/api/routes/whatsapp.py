"""Phone verification over WhatsApp (used by sign-up). See services/whatsapp/service.py."""

from __future__ import annotations

import logging
import time
from collections import defaultdict, deque
from datetime import datetime
from threading import Lock
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.db.session import SessionLocal, get_db
from app.services.guest_rate_limit import _client_ip
from app.services.whatsapp import service
from app.services.whatsapp.inbound import inbound_text_messages, signature_is_valid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth/whatsapp", tags=["Authentication"])

DbDep = Annotated[Session, Depends(get_db)]

_START_LIMIT_PER_10_MIN = 10
_buckets: dict[str, deque[float]] = defaultdict(deque)
_lock = Lock()


def _limit_start(request: Request) -> None:
    key = _client_ip(request)
    now = time.monotonic()
    with _lock:
        bucket = _buckets[key]
        while bucket and bucket[0] < now - 600:
            bucket.popleft()
        if len(bucket) >= _START_LIMIT_PER_10_MIN:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many verification attempts. Please wait a few minutes.",
            )
        bucket.append(now)


def _raise(exc: service.VerificationError) -> None:
    raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


class StartIn(BaseModel):
    phone: str = Field(min_length=8, max_length=24)
    purpose: str = Field(default="signup", pattern="^(signup|reset)$")


class StartOut(BaseModel):
    poll_secret: str
    link: str
    message: str
    business_number: str
    expires_at: datetime
    dev_simulate: bool


class SecretIn(BaseModel):
    poll_secret: str = Field(min_length=16, max_length=128)


class StatusOut(BaseModel):
    status: str
    reason: str | None
    expires_at: datetime


class VerifyIn(SecretIn):
    code: str = Field(min_length=4, max_length=10)


class VerifyOut(BaseModel):
    verified: bool
    phone: str


class SimulateOut(BaseModel):
    code: str


@router.post("/start", response_model=StartOut, status_code=201)
def start_verification(body: StartIn, request: Request, db: DbDep) -> StartOut:
    _limit_start(request)
    try:
        started = service.start(db, body.phone, body.purpose)
    except service.VerificationError as exc:
        _raise(exc)
    return StartOut(**started.__dict__)


@router.post("/status", response_model=StatusOut)
def verification_status(body: SecretIn, db: DbDep) -> StatusOut:
    try:
        found = service.status(db, body.poll_secret)
    except service.VerificationError as exc:
        _raise(exc)
    return StatusOut(status=found.status, reason=found.reason, expires_at=found.expires_at)


@router.post("/verify", response_model=VerifyOut)
def verify_code(body: VerifyIn, db: DbDep) -> VerifyOut:
    try:
        challenge = service.verify(db, body.poll_secret, body.code)
    except service.VerificationError as exc:
        _raise(exc)
    return VerifyOut(verified=True, phone=challenge.phone)


@router.post("/dev/simulate", response_model=SimulateOut, include_in_schema=False)
def dev_simulate(body: SecretIn, db: DbDep) -> SimulateOut:
    try:
        return SimulateOut(code=service.dev_simulate(db, body.poll_secret))
    except service.VerificationError as exc:
        _raise(exc)


@router.get("/webhook", include_in_schema=False)
def webhook_handshake(request: Request) -> PlainTextResponse:
    """Meta's subscription check: echo hub.challenge as plain text."""
    params = request.query_params
    expected = settings.WHATSAPP_VERIFY_TOKEN
    if (
        params.get("hub.mode") == "subscribe"
        and expected
        and params.get("hub.verify_token") == expected
    ):
        return PlainTextResponse(params.get("hub.challenge") or "")
    return PlainTextResponse("", status_code=status.HTTP_403_FORBIDDEN)


@router.post("/webhook", include_in_schema=False)
async def webhook_receive(request: Request) -> dict:
    """Inbound WhatsApp messages. Always 200 once authentic (Meta retries for a week)."""
    raw = await request.body()

    if settings.WHATSAPP_APP_SECRET:
        if not signature_is_valid(
            raw_body=raw,
            header=request.headers.get("X-Hub-Signature-256"),
            app_secret=settings.WHATSAPP_APP_SECRET,
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bad signature.")
    elif settings.DEBUG or settings.WHATSAPP_DEV_SIMULATE:
        logger.warning(
            "Accepting an UNSIGNED WhatsApp webhook (WHATSAPP_APP_SECRET unset). "
            "Development only — anyone who finds this URL could verify any number."
        )
    else:
        # Production without the secret: refuse rather than trust strangers.
        logger.error("WhatsApp webhook rejected: WHATSAPP_APP_SECRET is not set.")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not configured.")

    messages = inbound_text_messages(raw)
    if messages:
        await run_in_threadpool(_claim_all, messages)
    return {"received": True}


def _claim_all(messages) -> None:
    with SessionLocal() as db:
        for message in messages:
            outcome = service.claim(
                db, wa_id=message.wa_id, body=message.text, message_id=message.message_id
            )
            # The phone number is deliberately not logged.
            logger.info("WhatsApp verification outcome=%s message_id=%s", outcome, message.message_id)
