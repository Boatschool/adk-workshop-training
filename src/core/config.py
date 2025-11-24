"""Application configuration using Pydantic Settings"""

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = Field(default="ADK Platform", alias="APP_NAME")
    app_version: str = Field(default="2.0.0", alias="APP_VERSION")
    app_env: Literal["development", "staging", "production"] = Field(
        default="development", alias="APP_ENV"
    )
    app_debug: bool = Field(default=False, alias="APP_DEBUG")

    # Server
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8080, alias="PORT")  # 8080 to avoid conflict with ADK Visual Builder on 8000
    frontend_url: str = Field(default="http://localhost:4000", alias="FRONTEND_URL")

    # ADK Visual Builder
    adk_visual_builder_port: int = Field(default=8000, alias="ADK_VISUAL_BUILDER_PORT")
    adk_visual_builder_url: str = Field(
        default="http://localhost:8000/dev-ui", alias="ADK_VISUAL_BUILDER_URL"
    )

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://adk_user:adk_password@localhost:5432/adk_platform",
        alias="DATABASE_URL",
    )
    database_pool_size: int = Field(default=20, alias="DATABASE_POOL_SIZE")
    database_max_overflow: int = Field(default=10, alias="DATABASE_MAX_OVERFLOW")

    # Security
    secret_key: str = Field(..., alias="SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(
        default=60, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    refresh_token_expire_days: int = Field(default=7, alias="REFRESH_TOKEN_EXPIRE_DAYS")
    password_reset_token_expire_hours: int = Field(
        default=1, alias="PASSWORD_RESET_TOKEN_EXPIRE_HOURS"
    )

    # Account Lockout (Brute Force Protection)
    max_login_attempts: int = Field(default=5, alias="MAX_LOGIN_ATTEMPTS")
    lockout_duration_minutes: int = Field(default=15, alias="LOCKOUT_DURATION_MINUTES")

    # Rate Limiting
    rate_limit_requests_per_minute: int = Field(
        default=60, alias="RATE_LIMIT_REQUESTS_PER_MINUTE"
    )
    rate_limit_auth_requests_per_minute: int = Field(
        default=10, alias="RATE_LIMIT_AUTH_REQUESTS_PER_MINUTE"
    )

    # Google ADK
    google_api_key: str | None = Field(default=None, alias="GOOGLE_API_KEY")

    # CORS
    cors_origins: str = Field(
        default="http://localhost:4000,http://localhost:8080,http://localhost:8000", alias="CORS_ORIGINS"
    )

    # Logging
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO", alias="LOG_LEVEL"
    )
    log_format: Literal["json", "text"] = Field(default="json", alias="LOG_FORMAT")

    # Multi-tenancy
    default_tenant_schema_prefix: str = Field(
        default="adk_tenant_", alias="DEFAULT_TENANT_SCHEMA_PREFIX"
    )

    # Feature Flags
    enable_registration: bool = Field(default=True, alias="ENABLE_REGISTRATION")
    enable_visual_builder: bool = Field(default=True, alias="ENABLE_VISUAL_BUILDER")

    def get_cors_origins_list(self) -> list[str]:
        """Get CORS origins as a list"""
        if isinstance(self.cors_origins, str):
            return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        return self.cors_origins

    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.app_env == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.app_env == "production"

    @property
    def database_url_sync(self) -> str:
        """Get synchronous database URL for Alembic"""
        # Replace asyncpg with psycopg2 for sync operations
        return self.database_url.replace("+asyncpg", "")


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
