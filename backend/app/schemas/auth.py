import re

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    full_name: str = Field(
        min_length=2,
        max_length=150,
    )

    email: EmailStr

    phone: str = Field(
        min_length=8,
        max_length=20,
    )

    password: str = Field(
        min_length=8,
        max_length=128,
    )

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value: str) -> str:
        # Accept spaces, dashes and brackets; store "+" and digits only.
        phone = re.sub(r"[\s\-().]", "", value)

        if not re.fullmatch(r"\+?\d{8,15}", phone):
            raise ValueError("Enter a valid phone number")

        return phone


class LoginRequest(BaseModel):
    email: EmailStr

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

