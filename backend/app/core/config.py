from functools import lru_cache

from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    APP_NAME: str = "AXION API"
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