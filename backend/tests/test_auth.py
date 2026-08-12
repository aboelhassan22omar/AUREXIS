from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


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


def test_login_validation_rejects_invalid_email():
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "invalid-email",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 422