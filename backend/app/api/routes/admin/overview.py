from fastapi import APIRouter

from app.api.deps import (
    AdminUserDependency,
    DatabaseDependency,
)
from app.schemas.admin import (
    AdminOverviewResponse,
)
from app.services.admin_service import (
    get_admin_overview,
)


router = APIRouter(
    prefix="/admin/overview",
    tags=["Admin - Overview"],
)


@router.get(
    "",
    response_model=AdminOverviewResponse,
)
def overview(
    db: DatabaseDependency,
    admin: AdminUserDependency,
) -> AdminOverviewResponse:
    data = get_admin_overview(
        db
    )

    return AdminOverviewResponse(
        **data
    )