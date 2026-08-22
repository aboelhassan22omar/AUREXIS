"""add chat conversations and messages

Revision ID: 9f4c3a8d2e11
Revises: 67b446386116
Create Date: 2026-08-15 03:18:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9f4c3a8d2e11"
down_revision: Union[str, Sequence[str], None] = "67b446386116"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "chat_conversations",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "title",
            sa.String(length=180),
            nullable=False,
        ),
        sa.Column(
            "generation_token",
            sa.String(length=36),
            nullable=True,
        ),
        sa.Column(
            "generation_started_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_chat_conversations_id"),
        "chat_conversations",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_chat_conversations_user_id"),
        "chat_conversations",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_chat_conversations_updated_at"),
        "chat_conversations",
        ["updated_at"],
        unique=False,
    )

    op.create_table(
        "chat_messages",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "conversation_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "role",
            sa.String(length=20),
            nullable=False,
        ),
        sa.Column(
            "content",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "role IN ('user', 'assistant')",
            name="ck_chat_messages_role",
        ),
        sa.ForeignKeyConstraint(
            ["conversation_id"],
            ["chat_conversations.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_chat_messages_id"),
        "chat_messages",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_chat_messages_conversation_id"),
        "chat_messages",
        ["conversation_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_chat_messages_conversation_id"),
        table_name="chat_messages",
    )
    op.drop_index(
        op.f("ix_chat_messages_id"),
        table_name="chat_messages",
    )
    op.drop_table("chat_messages")

    op.drop_index(
        op.f("ix_chat_conversations_updated_at"),
        table_name="chat_conversations",
    )
    op.drop_index(
        op.f("ix_chat_conversations_user_id"),
        table_name="chat_conversations",
    )
    op.drop_index(
        op.f("ix_chat_conversations_id"),
        table_name="chat_conversations",
    )
    op.drop_table("chat_conversations")
