from datetime import datetime, timezone

from jwt import InvalidTokenError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.core.config import settings
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.services.user_service import get_user_by_email
from app.services.whatsapp import service as whatsapp_service


def register_user(
    db: Session,
    data: RegisterRequest,
) -> User:
    existing_user = get_user_by_email(
        db,
        data.email,
    )

    if existing_user is not None:
        raise ValueError(
            "Email already registered"
        )

    if settings.SIGNUP_REQUIRE_PHONE and not data.username:
        raise PermissionError("Please choose a username.")

    if data.username and db.scalar(
        select(User.id).where(User.username == data.username)
    ) is not None:
        raise ValueError("Username already taken")

    phone: str | None = None

    if settings.SIGNUP_REQUIRE_PHONE or data.phone:
        if not data.phone or not data.phone_verification:
            raise PermissionError(
                "Please verify your phone number over WhatsApp first."
            )

        # Raises VerificationError; committed together with the user below.
        phone = whatsapp_service.consume_for_signup(
            db,
            data.phone_verification,
            data.phone,
        )

        if db.scalar(select(User.id).where(User.phone == phone)) is not None:
            raise ValueError("Phone number already registered")

    user = User(
        full_name=data.full_name.strip(),
        email=data.email.lower(),
        username=data.username,
        hashed_password=hash_password(
            data.password
        ),
        phone=phone,
        phone_verified_at=(
            datetime.now(timezone.utc) if phone else None
        ),
        is_active=True,
        is_admin=False,
    )

    db.add(user)

    try:
        db.commit()

    except IntegrityError as exc:
        db.rollback()

        raise ValueError(
            "Email, username or phone number already registered"
        ) from exc

    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:
    identifier = email.strip().lower()

    if "@" in identifier:
        user = get_user_by_email(db, identifier)
    else:
        user = db.scalar(select(User).where(User.username == identifier))

    if user is None:
        return None

    if not verify_password(
        password,
        user.hashed_password,
    ):
        return None

    if not user.is_active:
        return None

    return user


def create_token_pair(
    db: Session,
    user: User,
) -> tuple[str, str]:
    access_token = create_access_token(
        str(user.id)
    )

    (
        refresh_token,
        jti,
        expires_at,
    ) = create_refresh_token(
        str(user.id)
    )

    token_record = RefreshToken(
        user_id=user.id,
        jti=jti,
        expires_at=expires_at,
    )

    db.add(token_record)
    db.commit()

    return access_token, refresh_token


def rotate_refresh_token(
    db: Session,
    token: str,
) -> tuple[str, str]:
    try:
        payload = decode_refresh_token(token)

        user_id = int(payload["sub"])
        jti = payload["jti"]

    except (
        InvalidTokenError,
        KeyError,
        TypeError,
        ValueError,
    ) as exc:
        raise ValueError(
            "Invalid refresh token"
        ) from exc

    statement = select(RefreshToken).where(
        RefreshToken.jti == jti
    )

    token_record = db.scalar(statement)

    if token_record is None:
        raise ValueError(
            "Invalid refresh token"
        )

    if token_record.is_revoked:
        raise ValueError(
            "Refresh token has been revoked"
        )

    if (
        token_record.expires_at
        <= datetime.now(timezone.utc)
    ):
        raise ValueError(
            "Refresh token has expired"
        )

    user = db.get(User, user_id)

    if user is None or not user.is_active:
        raise ValueError(
            "Invalid user"
        )

    # Rotation: old refresh token cannot be reused.
    token_record.is_revoked = True

    access_token = create_access_token(
        str(user.id)
    )

    (
        new_refresh_token,
        new_jti,
        new_expires_at,
    ) = create_refresh_token(
        str(user.id)
    )

    db.add(
        RefreshToken(
            user_id=user.id,
            jti=new_jti,
            expires_at=new_expires_at,
        )
    )

    db.commit()

    return access_token, new_refresh_token


def revoke_refresh_token(
    db: Session,
    token: str,
) -> None:
    try:
        payload = decode_refresh_token(token)
        jti = payload["jti"]

    except (
        InvalidTokenError,
        KeyError,
    ) as exc:
        raise ValueError(
            "Invalid refresh token"
        ) from exc

    statement = select(RefreshToken).where(
        RefreshToken.jti == jti
    )

    token_record = db.scalar(statement)

    if token_record is None:
        raise ValueError(
            "Invalid refresh token"
        )

    token_record.is_revoked = True

    db.commit()

def reset_password_with_phone(
    db: Session,
    *,
    phone: str,
    phone_verification: str,
    new_password: str,
) -> User:
    """Set a new password once WhatsApp has proven the account's phone.

    Every refresh token is revoked so sessions elsewhere are signed out.
    """
    verified_phone = whatsapp_service.consume_for_reset(
        db,
        phone_verification,
        phone,
    )

    user = db.scalar(select(User).where(User.phone == verified_phone))

    if user is None or not user.is_active:
        db.rollback()
        raise PermissionError("No active account uses this number.")

    user.hashed_password = hash_password(new_password)

    for token in db.scalars(
        select(RefreshToken).where(
            RefreshToken.user_id == user.id,
            RefreshToken.is_revoked.is_(False),
        )
    ):
        token.is_revoked = True

    db.commit()
    db.refresh(user)

    return user
