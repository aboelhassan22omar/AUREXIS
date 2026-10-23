"""auth schema baseline (sign in by email only)

Revision ID: a8c4d1e7f2b9
Revises: 4a7e2c1d9b30
Create Date: 2026-10-14 15:00:00

"""

from typing import Sequence, Union


revision: str = "a8c4d1e7f2b9"
down_revision: Union[str, Sequence[str], None] = "4a7e2c1d9b30"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # No schema change: kept so databases already stamped at this revision
    # stay on the head.
    pass


def downgrade() -> None:
    pass
