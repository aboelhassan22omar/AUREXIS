"""add phone to users (collected at sign-up)

Revision ID: b5e7c2a9d4f1
Revises: a8c4d1e7f2b9
Create Date: 2026-10-23 12:00:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b5e7c2a9d4f1"
down_revision: Union[str, Sequence[str], None] = "a8c4d1e7f2b9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Nullable: existing accounts have no phone.
    op.add_column("users", sa.Column("phone", sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "phone")
