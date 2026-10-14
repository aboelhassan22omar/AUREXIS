from pydantic import BaseModel, EmailStr, Field, field_validator

USERNAME_PATTERN = r"^[a-z0-9](?:[a-z0-9._]{1,28}[a-z0-9])$"

from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    full_name: str = Field(
        min_length=2,
        max_length=150,
    )

    email: EmailStr

    # 3-30 chars: letters, digits, "." and "_"; stored lowercase.
    username: str | None = Field(default=None, pattern=USERNAME_PATTERN)

    password: str = Field(
        min_length=8,
        max_length=128,
    )

    @field_validator("username", mode="before")
    @classmethod
    def _lower_username(cls, value: str | None) -> str | None:
        return value.strip().lower() if isinstance(value, str) else value


class LoginRequest(BaseModel):
    # Email address or username.
    email: str = Field(min_length=3, max_length=255)

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    user: UserResponse

    access_token: str
    refresh_token: str

    token_type: str = "bearer"


class RefreshResponse(BaseModel):
    access_token: str
    refresh_token: str

    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str

class AvailabilityRequest(BaseModel):
    email: EmailStr | None = None
    username: str | None = Field(default=None, max_length=30)


class AvailabilityResponse(BaseModel):
    email_available: bool | None = None
    username_available: bool | None = None
    username_valid: bool | None = None

