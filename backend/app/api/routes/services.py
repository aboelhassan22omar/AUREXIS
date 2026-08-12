from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.service import (
    ServiceResponse,
)
from app.services.service_service import (
    get_service_by_slug,
    get_services,
)


router = APIRouter(
    prefix="/services",
    tags=["Services"],
)


@router.get(
    "",
    response_model=list[ServiceResponse],
)
def list_services(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    active_only: bool = Query(
        default=True,
    ),
) -> list[ServiceResponse]:
    services = get_services(
        db,
        active_only=active_only,
    )

    return [
        ServiceResponse.model_validate(
            service
        )
        for service in services
    ]


@router.get(
    "/{slug}",
    response_model=ServiceResponse,
)
def get_service(
    slug: str,
    db: Annotated[
        Session,
        Depends(get_db),
    ],
) -> ServiceResponse:
    service = get_service_by_slug(
        db,
        slug,
    )

    if (
        service is None
        or not service.is_active
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    return ServiceResponse.model_validate(
        service
    )