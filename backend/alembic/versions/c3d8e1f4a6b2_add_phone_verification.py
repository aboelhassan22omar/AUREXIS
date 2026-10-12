"""add user phone and WhatsApp phone verification

Revision ID: c3d8e1f4a6b2
Revises: 4a7e2c1d9b30
Create Date: 2026-10-11 12:00:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c3d8e1f4a6b2"
down_revision: Union[str, Sequence[str], None] = "4a7e2c1d9b30"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Nullable: accounts created before phone verification keep working.
    op.add_column("users", sa.Column("phone", sa.String(length=20), nullable=True))
    op.add_column(
        "users",
        sa.Column("phone_verified_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(op.f("ix_users_phone"), "users", ["phone"], unique=True)

    op.create_table(
        "phone_verifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nonce", sa.String(length=16), nullable=False),
        sa.Column("poll_secret_hash", sa.String(length=64), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("reason", sa.String(length=40), nullable=True),
        sa.Column("code_hash", sa.String(length=64), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("message_id", sa.String(length=128), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("code_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_phone_verifications_nonce"), "phone_verifications", ["nonce"], unique=True)
    op.create_index(
        op.f("ix_phone_verifications_poll_secret_hash"),
        "phone_verifications",
        ["poll_secret_hash"],
        unique=True,
    )
    op.create_index(op.f("ix_phone_verifications_phone"), "phone_verifications", ["phone"], unique=False)
    op.create_index(
        op.f("ix_phone_verifications_message_id"),
        "phone_verifications",
        ["message_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_phone_verifications_message_id"), table_name="phone_verifications")
    op.drop_index(op.f("ix_phone_verifications_phone"), table_name="phone_verifications")
    op.drop_index(op.f("ix_phone_verifications_poll_secret_hash"), table_name="phone_verifications")
    op.drop_index(op.f("ix_phone_verifications_nonce"), table_name="phone_verifications")
    op.drop_table("phone_verifications")
    op.drop_index(op.f("ix_users_phone"), table_name="users")
    op.drop_column("users", "phone_verified_at")
    op.drop_column("users", "phone")
