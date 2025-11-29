"""Security utilities for authentication and authorization."""

import hashlib
import hmac
from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt

from src.core.config import get_settings
from src.core.exceptions import AuthenticationError

settings = get_settings()


def hash_token(token: str) -> str:
    """
    Hash a token using HMAC-SHA256 with the application secret key.

    This is used for refresh tokens to prevent credential replay if the
    database is compromised. The original token is never stored.

    Args:
        token: Plain text token (e.g., refresh token)

    Returns:
        str: Hashed token (hex encoded)
    """
    return hmac.new(
        settings.secret_key.encode("utf-8"),
        token.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def verify_token_hash(token: str, hashed_token: str) -> bool:
    """
    Verify a token against its hash using constant-time comparison.

    Args:
        token: Plain text token to verify
        hashed_token: Previously hashed token from database

    Returns:
        bool: True if token matches the hash
    """
    computed_hash = hash_token(token)
    return hmac.compare_digest(computed_hash, hashed_token)


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        str: Hashed password
    """
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.

    Args:
        plain_password: Plain text password
        hashed_password: Hashed password

    Returns:
        bool: True if password matches
    """
    password_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Data to encode in the token (user_id, tenant_id, role)
        expires_delta: Token expiration time (default: 1 hour)

    Returns:
        str: JWT token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=settings.jwt_access_token_expire_minutes)

    to_encode.update({"exp": expire, "iat": datetime.now(UTC)})

    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT access token.

    Args:
        token: JWT token string

    Returns:
        dict: Decoded token data

    Raises:
        AuthenticationError: If token is invalid or expired
    """
    try:
        payload: dict[str, Any] = jwt.decode(
            token, settings.secret_key, algorithms=[settings.jwt_algorithm]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationError("Token has expired") from None
    except jwt.InvalidTokenError:
        raise AuthenticationError("Invalid token") from None
