from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.service import Service
from app.schemas.service import (
    ServiceCreate,
    ServiceUpdate,
)


def get_services(
    db: Session,
    active_only: bool = True,
) -> list[Service]:
    statement = select(Service).order_by(
        Service.id.asc()
    )

    if active_only:
        statement = statement.where(
            Service.is_active.is_(True)
        )

    return list(
        db.scalars(statement).all()
    )


def get_service_by_slug(
    db: Session,
    slug: str,
) -> Service | None:
    statement = select(Service).where(
        Service.slug == slug
    )

    return db.scalar(statement)


def create_service(
    db: Session,
    data: ServiceCreate,
) -> Service:
    service = Service(
        name=data.name.strip(),
        slug=data.slug.strip().lower(),
        short_description=(
            data.short_description.strip()
        ),
        description=data.description.strip(),
        is_active=data.is_active,
    )

    db.add(service)

    try:
        db.commit()

    except IntegrityError as exc:
        db.rollback()

        raise ValueError(
            "Service name or slug already exists"
        ) from exc

    db.refresh(service)

    return service


def update_service(
    db: Session,
    service: Service,
    data: ServiceUpdate,
) -> Service:
    update_data = data.model_dump(
        exclude_unset=True
    )

    if "name" in update_data:
        update_data["name"] = (
            update_data["name"].strip()
        )

    if "slug" in update_data:
        update_data["slug"] = (
            update_data["slug"]
            .strip()
            .lower()
        )

    if "short_description" in update_data:
        update_data["short_description"] = (
            update_data[
                "short_description"
            ].strip()
        )

    if "description" in update_data:
        update_data["description"] = (
            update_data[
                "description"
            ].strip()
        )

    for key, value in update_data.items():
        setattr(
            service,
            key,
            value,
        )

    try:
        db.commit()

    except IntegrityError as exc:
        db.rollback()

        raise ValueError(
            "Service name or slug already exists"
        ) from exc

    db.refresh(service)

    return service