"""Unit tests for security utilities."""

import os
from datetime import timedelta
from unittest.mock import patch

import pytest

# Set environment variables before importing modules
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only-not-for-production"

from src.core.exceptions import AuthenticationError
from src.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


class TestPasswordHashing:
    """Tests for password hashing functions."""

    def test_hash_password_returns_string(self) -> None:
        """Test that hash_password returns a string."""
        hashed = hash_password("my_password")
        assert isinstance(hashed, str)

    def test_hash_password_is_different_from_original(self) -> None:
        """Test that hashed password differs from original."""
        password = "my_password"
        hashed = hash_password(password)
        assert hashed != password

    def test_hash_password_generates_different_hashes(self) -> None:
        """Test that same password generates different hashes (due to salt)."""
        password = "same_password"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        # Different salts should produce different hashes
        assert hash1 != hash2

    def test_hash_password_with_special_characters(self) -> None:
        """Test hashing passwords with special characters."""
        passwords = [
            "p@ssw0rd!",
            "пароль",  # Cyrillic
            "密码",  # Chinese
            "🔐🔑",  # Emoji
            "a" * 70,  # Long password (bcrypt max is 72 bytes)
        ]

        for password in passwords:
            hashed = hash_password(password)
            assert isinstance(hashed, str)
            assert len(hashed) > 0


class TestPasswordVerification:
    """Tests for password verification functions."""

    def test_verify_correct_password(self) -> None:
        """Test verification of correct password."""
        password = "correct_password"
        hashed = hash_password(password)

        assert verify_password(password, hashed) is True

    def test_verify_incorrect_password(self) -> None:
        """Test verification fails for incorrect password."""
        hashed = hash_password("correct_password")

        assert verify_password("wrong_password", hashed) is False

    def test_verify_empty_password(self) -> None:
        """Test verification of empty password."""
        password = ""
        hashed = hash_password(password)

        assert verify_password(password, hashed) is True
        assert verify_password("non-empty", hashed) is False

    def test_verify_password_case_sensitive(self) -> None:
        """Test that password verification is case-sensitive."""
        password = "CaseSensitive"
        hashed = hash_password(password)

        assert verify_password("CaseSensitive", hashed) is True
        assert verify_password("casesensitive", hashed) is False
        assert verify_password("CASESENSITIVE", hashed) is False


class TestJWTTokenCreation:
    """Tests for JWT token creation."""

    def test_create_access_token_returns_string(self) -> None:
        """Test that create_access_token returns a string."""
        token = create_access_token(data={"sub": "user123"})
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_with_data(self) -> None:
        """Test token creation with payload data."""
        data = {
            "sub": "user-123",
            "tenant_id": "tenant-456",
            "role": "admin",
        }
        token = create_access_token(data=data)

        # Decode and verify payload
        decoded = decode_access_token(token)
        assert decoded["sub"] == "user-123"
        assert decoded["tenant_id"] == "tenant-456"
        assert decoded["role"] == "admin"

    def test_create_access_token_includes_timestamps(self) -> None:
        """Test that token includes exp and iat claims."""
        token = create_access_token(data={"sub": "user"})
        decoded = decode_access_token(token)

        assert "exp" in decoded
        assert "iat" in decoded
        assert decoded["exp"] > decoded["iat"]

    def test_create_access_token_with_custom_expiry(self) -> None:
        """Test token creation with custom expiry time."""
        short_expiry = timedelta(minutes=5)
        token = create_access_token(data={"sub": "user"}, expires_delta=short_expiry)

        decoded = decode_access_token(token)
        # Token should expire in ~5 minutes
        assert decoded["exp"] - decoded["iat"] == pytest.approx(300, abs=5)

    def test_create_access_token_does_not_modify_input(self) -> None:
        """Test that create_access_token doesn't modify the input dict."""
        original_data = {"sub": "user123"}
        data_copy = original_data.copy()

        create_access_token(data=original_data)

        assert original_data == data_copy


class TestJWTTokenDecoding:
    """Tests for JWT token decoding."""

    def test_decode_valid_token(self) -> None:
        """Test decoding a valid token."""
        data = {"sub": "user-123", "custom": "data"}
        token = create_access_token(data=data)

        decoded = decode_access_token(token)
        assert decoded["sub"] == "user-123"
        assert decoded["custom"] == "data"

    def test_decode_invalid_token_raises_error(self) -> None:
        """Test that decoding an invalid token raises AuthenticationError."""
        with pytest.raises(AuthenticationError) as exc_info:
            decode_access_token("invalid.token.string")

        assert "Invalid token" in str(exc_info.value)

    def test_decode_expired_token_raises_error(self) -> None:
        """Test that decoding an expired token raises AuthenticationError."""
        # Create a token that's already expired
        expired_delta = timedelta(seconds=-1)
        token = create_access_token(data={"sub": "user"}, expires_delta=expired_delta)

        with pytest.raises(AuthenticationError) as exc_info:
            decode_access_token(token)

        assert "Token has expired" in str(exc_info.value)

    def test_decode_malformed_token_raises_error(self) -> None:
        """Test that decoding a malformed token raises AuthenticationError."""
        malformed_tokens = [
            "",
            "not-a-jwt",
            "a.b",
            "a.b.c.d",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",  # Only header
        ]

        for token in malformed_tokens:
            with pytest.raises(AuthenticationError):
                decode_access_token(token)

    def test_decode_token_with_wrong_secret_raises_error(self) -> None:
        """Test that decoding with wrong secret raises AuthenticationError."""
        # Create a token with current secret
        token = create_access_token(data={"sub": "user"})

        # Try to decode with different secret by mocking settings
        with patch("src.core.security.settings") as mock_settings:
            mock_settings.secret_key = "different-secret-key"
            mock_settings.jwt_algorithm = "HS256"

            with pytest.raises(AuthenticationError) as exc_info:
                decode_access_token(token)

            assert "Invalid token" in str(exc_info.value)


class TestSecurityIntegration:
    """Integration tests combining password and JWT functions."""

    def test_password_hash_not_in_token(self) -> None:
        """Test that password hash is never included in tokens."""
        password = "user_password"
        hashed = hash_password(password)

        # Create token with user data
        token = create_access_token(
            data={
                "sub": "user-123",
                "email": "user@example.com",
            }
        )

        # Password hash should not appear in token
        assert hashed not in token

        decoded = decode_access_token(token)
        assert "password" not in decoded
        assert hashed not in str(decoded)

    def test_full_auth_flow(self) -> None:
        """Test a complete authentication flow."""
        # Step 1: Hash password for storage
        password = "SecureP@ss123"
        stored_hash = hash_password(password)

        # Step 2: Verify password on login
        assert verify_password(password, stored_hash) is True

        # Step 3: Create token on successful auth
        user_id = "user-123"
        tenant_id = "tenant-456"
        token = create_access_token(
            data={
                "sub": user_id,
                "tenant_id": tenant_id,
                "role": "participant",
            }
        )

        # Step 4: Decode token on subsequent requests
        decoded = decode_access_token(token)
        assert decoded["sub"] == user_id
        assert decoded["tenant_id"] == tenant_id
        assert decoded["role"] == "participant"
