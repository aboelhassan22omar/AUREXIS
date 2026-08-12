from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
)


ContactStatus = Literal[
    "new",
    "contacted",
    "qualified",
    "closed",
    "spam",
]


class ContactCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=150,
    )

    email: EmailStr

    company: str | None = Field(
        default=None,
        max_length=200,
    )

    message: str = Field(
        min_length=10,
        max_length=5000,
    )


class ContactStatusUpdate(BaseModel):
    status: ContactStatus


class ContactResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    company: str | None
    message: str
    status: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )