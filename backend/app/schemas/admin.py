from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class AdminOverviewUser(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    is_active: bool
    is_admin: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class AdminOverviewContact(BaseModel):
    id: int
    name: str
    email: EmailStr
    company: str | None
    status: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class AdminOverviewStats(BaseModel):
    total_users: int
    active_users: int

    total_leads: int
    new_leads: int

    total_services: int
    active_services: int

    total_projects: int
    active_projects: int
    featured_projects: int


class AdminOverviewResponse(BaseModel):
    stats: AdminOverviewStats

    recent_users: list[AdminOverviewUser]

    recent_contacts: list[
        AdminOverviewContact
    ]