import hashlib
import hmac
import os

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

import app.models  # noqa: F401 - register every table
from app.core.config import settings
from app.db.base import Base
from app.models.user import User
from app.services.whatsapp import rules, service
from app.services.whatsapp.gateway import RecordingGateway
from app.services.whatsapp.inbound import inbound_text_messages, signature_is_valid

PHONE = "+201288339613"


@pytest.fixture
def db(monkeypatch):
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    gateway = RecordingGateway()
    monkeypatch.setattr(settings, "WHATSAPP_NUMBER", "+201000000000")
    monkeypatch.setattr(settings, "WHATSAPP_DEV_SIMULATE", False)
    monkeypatch.setattr(service, "get_gateway", lambda: gateway)
    with Session(engine) as session:
        session.gateway = gateway  # type: ignore[attr-defined]
        yield session


def _code_from(gateway: RecordingGateway) -> str:
    body = gateway.sent[-1][1]
    return next(word for word in body.split() if word.rstrip(".").isdigit()).rstrip(".")


def test_phone_rules():
    assert rules.normalize_e164("+20 128 833 9613") == PHONE
    assert rules.normalize_e164("00201288339613") == PHONE
    assert rules.normalize_e164("01288339613") is None
    assert rules.extract_nonce("hello AUREXIS VERIFY: ABCD2345 thanks") == "ABCD2345"
    assert rules.extract_nonce("no code here") is None
    link = rules.click_to_chat_link("+201000000000", rules.prefilled_message("ABCD2345"))
    assert link.startswith("https://wa.me/201000000000?text=AUREXIS%20VERIFY%3A%20ABCD2345")


def test_full_flow_verifies_and_is_single_use(db):
    started = service.start(db, PHONE)
    nonce = rules.extract_nonce(started.message)

    assert service.status(db, started.poll_secret).status == rules.STATUS_PENDING

    outcome = service.claim(db, wa_id=rules.wa_id_of(PHONE), body=started.message, message_id="m1")
    assert outcome == "code_sent"
    # Meta's retries of the same delivery are ignored
    assert service.claim(db, wa_id=rules.wa_id_of(PHONE), body=started.message, message_id="m1") == "duplicate"

    with pytest.raises(service.VerificationError):
        service.verify(db, started.poll_secret, "000000" if _code_from(db.gateway) != "000000" else "111111")

    challenge = service.verify(db, started.poll_secret, _code_from(db.gateway))
    assert challenge.status == rules.STATUS_VERIFIED and nonce

    assert service.consume_for_signup(db, started.poll_secret, PHONE) == PHONE
    db.commit()
    with pytest.raises(service.VerificationError):
        service.consume_for_signup(db, started.poll_secret, PHONE)


def test_message_from_another_number_is_rejected(db):
    started = service.start(db, PHONE)
    outcome = service.claim(db, wa_id="201111111111", body=started.message, message_id="m2")

    assert outcome == "phone_mismatch"
    assert service.status(db, started.poll_secret).status == rules.STATUS_REJECTED


def test_registered_phone_cannot_start(db):
    db.add(User(full_name="A", email="a@example.com", hashed_password="x", phone=PHONE))
    db.commit()

    with pytest.raises(service.VerificationError) as caught:
        service.start(db, PHONE)
    assert caught.value.code == "phone_taken"


def test_dev_simulate_only_when_enabled(db, monkeypatch):
    started = service.start(db, PHONE)
    with pytest.raises(service.VerificationError):
        service.dev_simulate(db, started.poll_secret)

    monkeypatch.setattr(settings, "WHATSAPP_DEV_SIMULATE", True)
    code = service.dev_simulate(db, started.poll_secret)
    assert service.verify(db, started.poll_secret, code).status == rules.STATUS_VERIFIED


def test_webhook_signature_and_parsing():
    body = (
        b'{"entry":[{"changes":[{"value":{"messages":[{"from":"201288339613","id":"wamid.1",'
        b'"type":"text","text":{"body":"AUREXIS VERIFY: ABCD2345"}}]}}]}]}'
    )
    good = "sha256=" + hmac.new(b"secret", body, hashlib.sha256).hexdigest()

    assert signature_is_valid(raw_body=body, header=good, app_secret="secret")
    assert not signature_is_valid(raw_body=body, header="sha256=bad", app_secret="secret")
    assert not signature_is_valid(raw_body=body, header=None, app_secret="secret")

    [message] = inbound_text_messages(body)
    assert message.wa_id == "201288339613" and message.message_id == "wamid.1"
    assert inbound_text_messages(b"not json") == []


def test_reset_needs_a_registered_phone_and_its_own_purpose(db):
    with pytest.raises(service.VerificationError) as caught:
        service.start(db, PHONE, "reset")
    assert caught.value.code == "phone_unknown"

    db.add(User(full_name="A", email="a@example.com", hashed_password="x", phone=PHONE))
    db.commit()

    started = service.start(db, PHONE, "reset")
    service.claim(db, wa_id=rules.wa_id_of(PHONE), body=started.message, message_id="r1")
    assert "password reset code" in db.gateway.sent[-1][1]
    service.verify(db, started.poll_secret, _code_from(db.gateway))

    # a reset proof cannot be spent on a sign-up, and vice versa
    with pytest.raises(service.VerificationError):
        service.consume_for_signup(db, started.poll_secret, PHONE)
    assert service.consume_for_reset(db, started.poll_secret, PHONE) == PHONE
