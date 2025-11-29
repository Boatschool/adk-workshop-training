"""Audit logging for security-relevant events."""

import logging
from datetime import UTC, datetime
from enum import Enum
from typing import Any

from src.core.config import get_settings

settings = get_settings()

# Configure audit logger
audit_logger = logging.getLogger("adk.audit")


class AuditEvent(str, Enum):
    """Security-relevant audit events."""

    # Authentication events
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILURE = "LOGIN_FAILURE"
    LOGOUT = "LOGOUT"
    REGISTER = "REGISTER"

    # Token events
    TOKEN_REFRESH = "TOKEN_REFRESH"
    TOKEN_REVOKED = "TOKEN_REVOKED"

    # Password events
    PASSWORD_CHANGE = "PASSWORD_CHANGE"
    PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST"
    PASSWORD_RESET_COMPLETE = "PASSWORD_RESET_COMPLETE"

    # Account events
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED"
    ACCOUNT_UNLOCKED = "ACCOUNT_UNLOCKED"

    # Authorization events
    ACCESS_DENIED = "ACCESS_DENIED"


def log_audit_event(
    event: AuditEvent,
    *,
    tenant_id: str | None = None,
    user_id: str | None = None,
    email: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    details: dict[str, Any] | None = None,
    success: bool = True,
) -> None:
    """
    Log a security-relevant audit event.

    Args:
        event: The type of audit event
        tenant_id: The tenant context (if available)
        user_id: The user ID (if available)
        email: The user email (for login attempts before we have user_id)
        ip_address: Client IP address
        user_agent: Client user agent string
        details: Additional event-specific details
        success: Whether the operation was successful
    """
    timestamp = datetime.now(UTC).isoformat()

    log_data: dict[str, Any] = {
        "timestamp": timestamp,
        "event": event.value,
        "success": success,
        "tenant_id": tenant_id,
        "user_id": user_id,
        "email": _mask_email(email) if email else None,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "environment": settings.app_env,
    }

    # Add details if provided, but filter sensitive data
    if details:
        log_data["details"] = _filter_sensitive_data(details)

    # Log at appropriate level based on success/failure and event type
    if not success or event in (AuditEvent.LOGIN_FAILURE, AuditEvent.ACCOUNT_LOCKED):
        audit_logger.warning("audit_event", extra={"audit": log_data})
    else:
        audit_logger.info("audit_event", extra={"audit": log_data})


def _mask_email(email: str) -> str:
    """
    Partially mask email for privacy in logs.

    Example: john.doe@example.com -> j***e@example.com
    """
    if not email or "@" not in email:
        return "***"

    local, domain = email.split("@", 1)
    if len(local) <= 2:
        masked_local = local[0] + "***"
    else:
        masked_local = local[0] + "***" + local[-1]

    return f"{masked_local}@{domain}"


def _filter_sensitive_data(data: Any) -> Any:
    """
    Recursively filter sensitive data from audit log details.

    Handles dicts, lists, tuples, and string values that may contain sensitive data.
    Removes or masks fields that should not appear in logs.
    """
    sensitive_keys = {"password", "token", "secret", "api_key", "refresh_token", "access_token"}

    if isinstance(data, dict):
        filtered: dict[str, Any] = {}
        for key, value in data.items():
            key_lower = key.lower()
            if any(sensitive in key_lower for sensitive in sensitive_keys):
                filtered[key] = "[REDACTED]"
            else:
                filtered[key] = _filter_sensitive_data(value)
        return filtered

    elif isinstance(data, list | tuple):
        # Recursively filter each item in sequences
        filtered_list = [_filter_sensitive_data(item) for item in data]
        return type(data)(filtered_list) if isinstance(data, tuple) else filtered_list

    elif isinstance(data, str):
        # Check if string looks like a token (long alphanumeric with dots for JWTs)
        # JWTs have format: header.payload.signature (three base64 parts)
        if len(data) > 50 and "." in data and data.count(".") >= 2:
            return "[REDACTED_TOKEN]"
        # Check for bearer token patterns
        if data.lower().startswith("bearer "):
            return "[REDACTED_BEARER]"
        return data

    else:
        # Return other types as-is (int, float, bool, None, etc.)
        return data
