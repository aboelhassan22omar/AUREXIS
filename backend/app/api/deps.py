from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.user import User


DatabaseDependency = Annotated[
    Session,
    Depends(get_db),
]

CurrentUserDependency = Annotated[
    User,
    Depends(get_current_user),
]


def require_admin(
    current_user: CurrentUserDependency,
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive account",
        )

    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )

    return current_user


AdminUserDependency = Annotated[
    User,
    Depends(require_admin),
]