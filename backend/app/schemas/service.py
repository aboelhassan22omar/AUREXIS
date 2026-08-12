from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ServiceCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=150,
    )

    slug: str = Field(
        min_length=2,
        max_length=150,
        pattern=r"^[a-z0-9-]+$",
    )

    short_description: str = Field(
        min_length=10,
        max_length=300,
    )

    description: str = Field(
        min_length=20,
        max_length=5000,
    )

    is_active: bool = True


class ServiceUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    slug: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
        pattern=r"^[a-z0-9-]+$",
    )

    short_description: str | None = Field(
        default=None,
        min_length=10,
        max_length=300,
    )

    description: str | None = Field(
        default=None,
        min_length=20,
        max_length=5000,
    )

    is_active: bool | None = None


class ServiceResponse(BaseModel):
    id: int
    name: str
    slug: str
    short_description: str
    description: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )