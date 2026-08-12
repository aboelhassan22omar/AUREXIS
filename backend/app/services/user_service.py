from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserAdminUpdate


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    statement = select(User).where(
        User.email == email.lower()
    )

    return db.scalar(statement)


def get_user_by_id(
    db: Session,
    user_id: int,
) -> User | None:
    return db.get(User, user_id)


def get_users(
    db: Session,
) -> list[User]:
    statement = select(User).order_by(
        User.created_at.desc()
    )

    return list(
        db.scalars(statement).all()
    )


def update_user_admin_fields(
    db: Session,
    user: User,
    data: UserAdminUpdate,
) -> User:
    update_data = data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(
            user,
            key,
            value,
        )

    db.commit()
    db.refresh(user)

    return user