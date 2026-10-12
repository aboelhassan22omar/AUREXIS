from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PhoneVerification(Base):
    """One WhatsApp phone-ownership challenge (see services/whatsapp/service.py)."""

    __tablename__ = "phone_verifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Goes out in the wa.me link and comes back over WhatsApp.
    nonce: Mapped[str] = mapped_column(String(16), unique=True, index=True, nullable=False)
    # Never leaves the browser; stored only as a SHA-256 hash.
    poll_secret_hash: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )

    # The number the user typed (E.164). The WhatsApp sender must match it.
    phone: Mapped[str] = mapped_column(String(20), index=True, nullable=False)

    # "signup" (prove a new number) or "reset" (prove ownership to reset a password)
    purpose: Mapped[str] = mapped_column(String(16), nullable=False, default="signup")

    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    reason: Mapped[str | None] = mapped_column(String(40), nullable=True)
    code_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    message_id: Mapped[str | None] = mapped_column(
        String(128), unique=True, index=True, nullable=True
    )

    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    code_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
