from fastapi import (
    APIRouter,
    HTTPException,
    status,
)

from app.api.deps import (
    AdminUserDependency,
    DatabaseDependency,
)
from app.schemas.user import (
    UserAdminUpdate,
    UserResponse,
)
from app.services.user_service import (
    get_user_by_id,
    get_users,
    update_user_admin_fields,
)


router = APIRouter(
    prefix="/admin/users",
    tags=["Admin - Users"],
)


@router.get(
    "",
    response_model=list[UserResponse],
)
def list_users(
    db: DatabaseDependency,
    admin: AdminUserDependency,
) -> list[UserResponse]:
    users = get_users(db)

    return [
        UserResponse.model_validate(
            user
        )
        for user in users
    ]


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
)
def update_user(
    user_id: int,
    data: UserAdminUpdate,
    db: DatabaseDependency,
    admin: AdminUserDependency,
) -> UserResponse:
    user = get_user_by_id(
        db,
        user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == admin.id:
        if data.is_active is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own account",
            )

        if data.is_admin is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot remove your own administrator access",
            )

    updated_user = update_user_admin_fields(
        db,
        user,
        data,
    )

    return UserResponse.model_validate(
        updated_user
    )