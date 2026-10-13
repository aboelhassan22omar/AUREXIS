from functools import lru_cache

from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    APP_NAME: str = "AUREXIS API"
    APP_VERSION: str = "1.0.0"

    DEBUG: bool = False

    API_V1_PREFIX: str = "/api/v1"

    FRONTEND_URL: str = "http://localhost:3000"

    ALLOWED_HOSTS: str = (
        "localhost,127.0.0.1"
    )

    DATABASE_URL: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    CHAT_API_KEY: str | None = None
    CHAT_BASE_URL: str | None = None
    CHAT_MODEL: str | None = None
    CHAT_TIMEOUT_SECONDS: int = 75
    CHAT_MAX_OUTPUT_TOKENS: int = 1200
    CHAT_CONTEXT_MESSAGES: int = 20
    CHAT_MAX_MESSAGE_CHARS: int = 8000
    CHAT_RATE_LIMIT_PER_MINUTE: int = 20
    CHAT_TEMPERATURE: float = 0.35

    # --- WhatsApp phone verification (sign-up) -----------------------------
    # The business number users message, E.164 with "+", e.g. +201288339613.
    WHATSAPP_NUMBER: str = ""
    # Cloud API: the ID shown beside the number in Meta's console (not the number).
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    # System User token with whatsapp_business_messaging (dashboard tokens expire in 24h).
    WHATSAPP_TOKEN: str = ""
    WHATSAPP_GRAPH_VERSION: str = "v22.0"
    # Any string; must match the one typed into Meta's webhook form.
    WHATSAPP_VERIFY_TOKEN: str = ""
    # App settings -> Basic -> App Secret. Proves webhooks really come from Meta.
    WHATSAPP_APP_SECRET: str = ""
    WHATSAPP_CHALLENGE_TTL_MINUTES: int = 10
    # New accounts must verify a phone number over WhatsApp.
    SIGNUP_REQUIRE_PHONE: bool = True
    # --- development only: never enable where real users sign up ---------
    # Writes codes into the backend log.
    WHATSAPP_LOG_CODES: bool = False
    # Lets the sign-up page simulate the user's WhatsApp message (Meta cannot
    # reach a localhost webhook). The code is returned to the browser.
    WHATSAPP_DEV_SIMULATE: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def allowed_hosts_list(
        self,
    ) -> list[str]:
        return [
            host.strip()
            for host in self.ALLOWED_HOSTS.split(",")
            if host.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()