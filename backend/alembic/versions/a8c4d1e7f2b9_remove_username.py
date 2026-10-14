"""remove username (sign in by email only)

Revision ID: a8c4d1e7f2b9
Revises: f7b3c9d2a4e6
Create Date: 2026-10-14 15:00:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a8c4d1e7f2b9"
down_revision: Union[str, Sequence[str], None] = "f7b3c9d2a4e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_column("users", "username")


def downgrade() -> None:
    # Schema only: usernames dropped by upgrade() are not restored.
    op.add_column("users", sa.Column("username", sa.String(length=30), nullable=True))
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)
