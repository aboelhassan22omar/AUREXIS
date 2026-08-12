from fastapi import (
    APIRouter,
    HTTPException,
    status,
)

from app.api.deps import (
    AdminUserDependency,
    DatabaseDependency,
)
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
from app.services.project_service import (
    create_project,
    get_project_by_slug,
    update_project,
)


router = APIRouter(
    prefix="/admin/projects",
    tags=["Admin - Projects"],
)


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_project(
    data: ProjectCreate,
    db: DatabaseDependency,
    admin: AdminUserDependency,
) -> ProjectResponse:
    try:
        project = create_project(
            db,
            data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    return ProjectResponse.model_validate(
        project
    )


@router.patch(
    "/{slug}",
    response_model=ProjectResponse,
)
def edit_project(
    slug: str,
    data: ProjectUpdate,
    db: DatabaseDependency,
    admin: AdminUserDependency,
) -> ProjectResponse:
    project = get_project_by_slug(
        db,
        slug,
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    try:
        project = update_project(
            db,
            project,
            data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    return ProjectResponse.model_validate(
        project
    )