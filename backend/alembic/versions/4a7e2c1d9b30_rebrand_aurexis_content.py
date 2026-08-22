"""rebrand public company content to AUREXIS

Revision ID: 4a7e2c1d9b30
Revises: 9f4c3a8d2e11
Create Date: 2026-08-21 17:50:00.000000

This migration updates company-owned/public content only. It intentionally does
not rewrite user-submitted contact messages or user-authored chat messages.
"""

from typing import Sequence, Union

from alembic import op


revision: str = "4a7e2c1d9b30"
down_revision: Union[str, Sequence[str], None] = "9f4c3a8d2e11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _replace_brand(table: str, column: str) -> None:
    op.execute(
        f"""
        UPDATE {table}
        SET {column} = regexp_replace({column}, 'AXION', 'AUREXIS', 'gi')
        WHERE {column} ~* 'AXION'
        """
    )


def _restore_brand(table: str, column: str) -> None:
    op.execute(
        f"""
        UPDATE {table}
        SET {column} = regexp_replace({column}, 'AUREXIS', 'AXION', 'gi')
        WHERE {column} ~* 'AUREXIS'
        """
    )


def upgrade() -> None:
    for column in (
        "name",
        "slug",
        "short_description",
        "description",
    ):
        _replace_brand("services", column)

    for column in (
        "title",
        "slug",
        "category",
        "short_description",
        "description",
    ):
        _replace_brand("projects", column)

    _replace_brand("chat_conversations", "title")

    op.execute(
        """
        UPDATE chat_messages
        SET content = regexp_replace(content, 'AXION', 'AUREXIS', 'gi')
        WHERE role = 'assistant' AND content ~* 'AXION'
        """
    )


def downgrade() -> None:
    for column in (
        "name",
        "slug",
        "short_description",
        "description",
    ):
        _restore_brand("services", column)

    for column in (
        "title",
        "slug",
        "category",
        "short_description",
        "description",
    ):
        _restore_brand("projects", column)

    _restore_brand("chat_conversations", "title")

    op.execute(
        """
        UPDATE chat_messages
        SET content = regexp_replace(content, 'AUREXIS', 'AXION', 'gi')
        WHERE role = 'assistant' AND content ~* 'AUREXIS'
        """
    )
