from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    title: str = Field(
        min_length=2,
        max_length=200,
    )

    slug: str = Field(
        min_length=2,
        max_length=200,
        pattern=r"^[a-z0-9-]+$",
    )

    category: str = Field(
        min_length=2,
        max_length=120,
    )

    short_description: str = Field(
        min_length=10,
        max_length=300,
    )

    description: str = Field(
        min_length=20,
        max_length=5000,
    )

    is_featured: bool = False
    is_active: bool = True


class ProjectUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    slug: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
        pattern=r"^[a-z0-9-]+$",
    )

    category: str | None = Field(
        default=None,
        min_length=2,
        max_length=120,
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

    is_featured: bool | None = None
    is_active: bool | None = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    slug: str
    category: str
    short_description: str
    description: str
    is_featured: bool
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )