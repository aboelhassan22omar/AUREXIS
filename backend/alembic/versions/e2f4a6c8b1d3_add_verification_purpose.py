"""add purpose to phone verifications (sign-up / password reset)

Revision ID: e2f4a6c8b1d3
Revises: d9a1b7c2e5f3
Create Date: 2026-10-11 16:00:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e2f4a6c8b1d3"
down_revision: Union[str, Sequence[str], None] = "d9a1b7c2e5f3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "phone_verifications",
        sa.Column("purpose", sa.String(length=16), nullable=False, server_default="signup"),
    )


def downgrade() -> None:
    op.drop_column("phone_verifications", "purpose")
