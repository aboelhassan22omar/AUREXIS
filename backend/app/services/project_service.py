from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
)


def get_projects(
    db: Session,
    active_only: bool = True,
    featured_only: bool = False,
) -> list[Project]:
    statement = select(Project).order_by(
        Project.id.asc()
    )

    if active_only:
        statement = statement.where(
            Project.is_active.is_(True)
        )

    if featured_only:
        statement = statement.where(
            Project.is_featured.is_(True)
        )

    return list(
        db.scalars(statement).all()
    )


def get_project_by_slug(
    db: Session,
    slug: str,
) -> Project | None:
    statement = select(Project).where(
        Project.slug == slug
    )

    return db.scalar(statement)


def create_project(
    db: Session,
    data: ProjectCreate,
) -> Project:
    project = Project(
        title=data.title.strip(),
        slug=data.slug.strip().lower(),
        category=data.category.strip(),
        short_description=(
            data.short_description.strip()
        ),
        description=data.description.strip(),
        is_featured=data.is_featured,
        is_active=data.is_active,
    )

    db.add(project)

    try:
        db.commit()

    except IntegrityError as exc:
        db.rollback()

        raise ValueError(
            "Project slug already exists"
        ) from exc

    db.refresh(project)

    return project


def update_project(
    db: Session,
    project: Project,
    data: ProjectUpdate,
) -> Project:
    update_data = data.model_dump(
        exclude_unset=True
    )

    for key in (
        "title",
        "slug",
        "category",
        "short_description",
        "description",
    ):
        if (
            key in update_data
            and isinstance(
                update_data[key],
                str,
            )
        ):
            update_data[key] = (
                update_data[key].strip()
            )

    if "slug" in update_data:
        update_data["slug"] = (
            update_data["slug"].lower()
        )

    for key, value in update_data.items():
        setattr(
            project,
            key,
            value,
        )

    try:
        db.commit()

    except IntegrityError as exc:
        db.rollback()

        raise ValueError(
            "Project slug already exists"
        ) from exc

    db.refresh(project)

    return project