"""Configuration for ResQNet Gateway."""

import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


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

    # Security
    secret_key: str = "your-secret-key-change-this"

    # Optional external services
    gps_provider: str = "mock"
    sensor_aggregation_url: str = "http://localhost:8080"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[1] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
