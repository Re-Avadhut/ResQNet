"""Configuration for ResQNet Gateway."""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

#: Sentinel value. If settings.secret_key still equals this, no real key was set.
INSECURE_DEFAULT_SECRET_KEY = "your-secret-key-change-this"


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "sqlite:///./resqnet.db"

    # Node management
    node_timeout_seconds: int = 30
    heartbeat_interval_seconds: int = 10
    max_nodes: int = 50

    # Security.
    # This default is PUBLIC - it is committed to the repository. Anything
    # that ever signs tokens or sessions with it is trivially forgeable, so
    # a real deployment must override it in gateway/.env. main.py warns
    # loudly at startup while this placeholder is still in use.
    secret_key: str = INSECURE_DEFAULT_SECRET_KEY

    # Optional external services
    gps_provider: str = "mock"
    sensor_aggregation_url: str = "http://localhost:8080"

    model_config = SettingsConfigDict(
        env_file=("gateway/.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()