from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.contact import Contact
from app.schemas.contact import (
    ContactCreate,
    ContactStatusUpdate,
)


def create_contact(
    db: Session,
    data: ContactCreate,
) -> Contact:
    contact = Contact(
        name=data.name.strip(),
        email=str(data.email).lower(),
        company=(
            data.company.strip()
            if data.company
            else None
        ),
        message=data.message.strip(),
        status="new",
    )

    db.add(contact)
    db.commit()
    db.refresh(contact)

    return contact


def get_contacts(
    db: Session,
) -> list[Contact]:
    statement = (
        select(Contact)
        .order_by(
            Contact.created_at.desc()
        )
    )

    return list(
        db.scalars(statement).all()
    )


def get_contact_by_id(
    db: Session,
    contact_id: int,
) -> Contact | None:
    return db.get(
        Contact,
        contact_id,
    )


def update_contact_status(
    db: Session,
    contact: Contact,
    data: ContactStatusUpdate,
) -> Contact:
    contact.status = data.status

    db.commit()
    db.refresh(contact)

    return contact