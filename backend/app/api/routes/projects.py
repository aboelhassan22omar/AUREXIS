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
from app.schemas.project import (
    ProjectResponse,
)
from app.services.project_service import (
    get_project_by_slug,
    get_projects,
)


router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


@router.get(
    "",
    response_model=list[ProjectResponse],
)
def list_projects(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    active_only: bool = Query(
        default=True,
    ),
    featured_only: bool = Query(
        default=False,
    ),
) -> list[ProjectResponse]:
    projects = get_projects(
        db,
        active_only=active_only,
        featured_only=featured_only,
    )

    return [
        ProjectResponse.model_validate(
            project
        )
        for project in projects
    ]


@router.get(
    "/{slug}",
    response_model=ProjectResponse,
)
def get_project(
    slug: str,
    db: Annotated[
        Session,
        Depends(get_db),
    ],
) -> ProjectResponse:
    project = get_project_by_slug(
        db,
        slug,
    )

    if (
        project is None
        or not project.is_active
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return ProjectResponse.model_validate(
        project
    )