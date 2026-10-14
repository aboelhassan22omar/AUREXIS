from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.main import app
from app.schemas.auth import RegisterRequest
from app.services.auth_service import register_user


client = TestClient(app, base_url="http://localhost")


def test_register_validation_rejects_short_password():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": "test@example.com",
            "password": "123456",
        },
    )

    assert response.status_code == 422


def test_login_validation_rejects_too_short_identifier():
    # Login accepts an email or a username; anything under 3 chars is invalid.
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "ab",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 422


def test_register_needs_no_phone_verification():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        user = register_user(
            db,
            RegisterRequest(
                full_name="Test User",
                email="Test@Example.com",
                username="test.user",
                password="TestPassword123!",
            ),
        )

        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.username == "test.user"
