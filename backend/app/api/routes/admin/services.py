from fastapi import (
    APIRouter,
    HTTPException,
    status,
)

from app.api.deps import (
    AdminUserDependency,
    DatabaseDependency,
)
from app.schemas.service import (
    ServiceCreate,
    ServiceResponse,
    ServiceUpdate,
)
from app.services.service_service import (
    create_service,
    get_service_by_slug,
    update_service,
)


router = APIRouter(
    prefix="/admin/services",
    tags=["Admin - Services"],
)


@router.post(
    "",
    response_model=ServiceResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_service(
    data: ServiceCreate,
    db: DatabaseDependency,
    admin: AdminUserDependency,
) -> ServiceResponse:
    try:
        service = create_service(
            db,
            data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    return ServiceResponse.model_validate(
        service
    )


@router.patch(
    "/{slug}",
    response_model=ServiceResponse,
)
def edit_service(
    slug: str,
    data: ServiceUpdate,
    db: DatabaseDependency,
    admin: AdminUserDependency,
) -> ServiceResponse:
    service = get_service_by_slug(
        db,
        slug,
    )

    if service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    try:
        service = update_service(
            db,
            service,
            data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    return ServiceResponse.model_validate(
        service
    )