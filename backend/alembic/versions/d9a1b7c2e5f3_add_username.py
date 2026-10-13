"""add username to users

Revision ID: d9a1b7c2e5f3
Revises: c3d8e1f4a6b2
Create Date: 2026-10-11 14:00:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d9a1b7c2e5f3"
down_revision: Union[str, Sequence[str], None] = "c3d8e1f4a6b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Nullable: existing accounts keep signing in with their email.
    op.add_column("users", sa.Column("username", sa.String(length=30), nullable=True))
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_column("users", "username")
