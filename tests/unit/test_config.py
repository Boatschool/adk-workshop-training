"""Unit tests for configuration management."""


class TestSettings:
    """Tests for Settings class."""

    def test_settings_loads_from_env(self) -> None:
        """Test Settings loads values from environment."""
        from src.core.config import Settings

        # Settings should load SECRET_KEY from environment (set by conftest)
        settings = Settings(_env_file=None)
        assert settings.secret_key is not None
        assert len(settings.secret_key) > 0

    def test_settings_has_default_values(self) -> None:
        """Test default values are set correctly."""
        from src.core.config import Settings

        settings = Settings(_env_file=None)

        # Check defaults that won't be overridden by env
        assert settings.app_name == "ADK Platform"
        assert settings.app_version == "2.0.0"
        assert settings.jwt_algorithm == "HS256"

    def test_settings_app_env_development(self) -> None:
        """Test development environment settings."""
        from src.core.config import Settings

        settings = Settings(_env_file=None)
        # By default or from env, should be development
        assert settings.app_env in ["development", "staging", "production"]


class TestSettingsProperties:
    """Tests for Settings property methods."""

    def test_is_development_or_production(self) -> None:
        """Test environment detection properties."""
        from src.core.config import Settings

        settings = Settings(_env_file=None)

        # One of these must be true based on app_env
        is_dev = settings.is_development
        is_prod = settings.is_production

        if settings.app_env == "development":
            assert is_dev is True
            assert is_prod is False
        elif settings.app_env == "production":
            assert is_dev is False
            assert is_prod is True
        else:
            assert is_dev is False
            assert is_prod is False

    def test_database_url_sync_property(self) -> None:
        """Test database_url_sync removes asyncpg."""
        from src.core.config import Settings

        settings = Settings(_env_file=None)
        sync_url = settings.database_url_sync

        # Should not contain +asyncpg
        assert "+asyncpg" not in sync_url
        # Should start with postgresql
        assert sync_url.startswith("postgresql")


class TestCorsOrigins:
    """Tests for CORS origins handling."""

    def test_get_cors_origins_list_returns_list(self) -> None:
        """Test that get_cors_origins_list returns a list."""
        from src.core.config import Settings

        settings = Settings(_env_file=None)
        origins = settings.get_cors_origins_list()

        assert isinstance(origins, list)

    def test_get_cors_origins_list_entries_are_strings(self) -> None:
        """Test that CORS origins entries are strings."""
        from src.core.config import Settings

        settings = Settings(_env_file=None)
        origins = settings.get_cors_origins_list()

        for origin in origins:
            assert isinstance(origin, str)


class TestMultiTenancyConfig:
    """Tests for multi-tenancy configuration."""

    def test_default_tenant_schema_prefix_exists(self) -> None:
        """Test default tenant schema prefix exists."""
        from src.core.config import Settings

        settings = Settings(_env_file=None)
        assert settings.default_tenant_schema_prefix is not None
        assert len(settings.default_tenant_schema_prefix) > 0

    def test_tenant_schema_prefix_has_underscore(self) -> None:
        """Test tenant schema prefix ends with underscore."""
        from src.core.config import Settings

        settings = Settings(_env_file=None)
        # Prefix should end with underscore for clean schema names
        assert settings.default_tenant_schema_prefix.endswith("_")


class TestGetSettingsCaching:
    """Tests for get_settings caching behavior."""

    def test_get_settings_returns_settings_instance(self) -> None:
        """Test that get_settings returns a Settings instance."""
        from src.core.config import Settings, get_settings

        settings = get_settings()
        assert isinstance(settings, Settings)

    def test_get_settings_is_cached(self) -> None:
        """Test that get_settings returns the same cached instance."""
        from src.core.config import get_settings

        settings1 = get_settings()
        settings2 = get_settings()

        # Should be the same object (cached)
        assert settings1 is settings2

    def test_settings_has_required_fields(self) -> None:
        """Test that settings has all required fields."""
        from src.core.config import get_settings

        settings = get_settings()

        # Check all required fields exist
        assert hasattr(settings, "secret_key")
        assert hasattr(settings, "database_url")
        assert hasattr(settings, "app_env")
        assert hasattr(settings, "jwt_algorithm")
        assert hasattr(settings, "jwt_access_token_expire_minutes")
