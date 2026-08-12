from fastapi import (
    APIRouter,
    HTTPException,
    status,
)

from app.api.deps import (
    AdminUserDependency,
    DatabaseDependency,
)
from app.schemas.contact import (
    ContactResponse,
    ContactStatusUpdate,
)
from app.services.contact_service import (
    get_contact_by_id,
    get_contacts,
    update_contact_status,
)


router = APIRouter(
    prefix="/admin/contacts",
    tags=["Admin - Contacts"],
)


@router.get(
    "",
    response_model=list[ContactResponse],
)
def list_contacts(
    db: DatabaseDependency,
    admin: AdminUserDependency,
) -> list[ContactResponse]:
    contacts = get_contacts(db)

    return [
        ContactResponse.model_validate(
            contact
        )
        for contact in contacts
    ]


@router.get(
    "/{contact_id}",
    response_model=ContactResponse,
)
def get_contact(
    contact_id: int,
    db: DatabaseDependency,
    admin: AdminUserDependency,
) -> ContactResponse:
    contact = get_contact_by_id(
        db,
        contact_id,
    )

    if contact is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )

    return ContactResponse.model_validate(
        contact
    )


@router.patch(
    "/{contact_id}/status",
    response_model=ContactResponse,
)
def change_contact_status(
    contact_id: int,
    data: ContactStatusUpdate,
    db: DatabaseDependency,
    admin: AdminUserDependency,
) -> ContactResponse:
    contact = get_contact_by_id(
        db,
        contact_id,
    )

    if contact is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )

    contact = update_contact_status(
        db,
        contact,
        data,
    )

    return ContactResponse.model_validate(
        contact
    )