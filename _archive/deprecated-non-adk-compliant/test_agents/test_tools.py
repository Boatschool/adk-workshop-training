"""Tests for common agent tools."""

import pytest
from datetime import datetime

from src.agents.tools.common import (
    get_current_datetime,
    format_date,
    format_time,
    validate_email,
    validate_phone,
    generate_reference_number,
    calculate_business_hours,
    sanitize_input,
)


class TestGetCurrentDatetime:
    """Tests for get_current_datetime function."""

    def test_returns_dict(self):
        """Test function returns dictionary."""
        result = get_current_datetime()

        assert isinstance(result, dict)

    def test_contains_required_keys(self):
        """Test result contains all required keys."""
        result = get_current_datetime()

        assert "date" in result
        assert "time" in result
        assert "day_of_week" in result
        assert "iso_timestamp" in result

    def test_date_format(self):
        """Test date is in correct format."""
        result = get_current_datetime()

        # Should be YYYY-MM-DD
        datetime.strptime(result["date"], "%Y-%m-%d")

    def test_time_format(self):
        """Test time is in correct format."""
        result = get_current_datetime()

        # Should be HH:MM:SS
        datetime.strptime(result["time"], "%H:%M:%S")


class TestFormatDate:
    """Tests for format_date function."""

    def test_default_format(self):
        """Test default output format."""
        result = format_date("2024-01-15")

        assert result == "January 15, 2024"

    def test_custom_format(self):
        """Test custom output format."""
        result = format_date("2024-01-15", "%d/%m/%Y")

        assert result == "15/01/2024"

    def test_invalid_date(self):
        """Test invalid date handling."""
        result = format_date("invalid")

        assert "Invalid date format" in result


class TestFormatTime:
    """Tests for format_time function."""

    def test_with_ampm(self):
        """Test 12-hour format with AM/PM."""
        result = format_time("14:30")

        assert result == "02:30 PM"

    def test_without_ampm(self):
        """Test 12-hour format without AM/PM."""
        result = format_time("14:30", include_ampm=False)

        assert result == "02:30"

    def test_morning_time(self):
        """Test morning time formatting."""
        result = format_time("09:15")

        assert result == "09:15 AM"

    def test_invalid_time(self):
        """Test invalid time handling."""
        result = format_time("invalid")

        assert "Invalid time format" in result


class TestValidateEmail:
    """Tests for validate_email function."""

    def test_valid_email(self):
        """Test valid email addresses."""
        result = validate_email("user@example.com")

        assert result["is_valid"] is True
        assert result["email"] == "user@example.com"

    def test_valid_email_with_subdomain(self):
        """Test valid email with subdomain."""
        result = validate_email("user@mail.example.com")

        assert result["is_valid"] is True

    def test_valid_email_with_plus(self):
        """Test valid email with plus sign."""
        result = validate_email("user+tag@example.com")

        assert result["is_valid"] is True

    def test_invalid_email_no_at(self):
        """Test invalid email without @."""
        result = validate_email("userexample.com")

        assert result["is_valid"] is False

    def test_invalid_email_no_domain(self):
        """Test invalid email without domain."""
        result = validate_email("user@")

        assert result["is_valid"] is False

    def test_invalid_email_no_tld(self):
        """Test invalid email without TLD."""
        result = validate_email("user@example")

        assert result["is_valid"] is False


class TestValidatePhone:
    """Tests for validate_phone function."""

    def test_valid_phone_plain(self):
        """Test valid phone number without formatting."""
        result = validate_phone("5551234567")

        assert result["is_valid"] is True
        assert result["normalized"] == "(555) 123-4567"

    def test_valid_phone_with_dashes(self):
        """Test valid phone number with dashes."""
        result = validate_phone("555-123-4567")

        assert result["is_valid"] is True

    def test_valid_phone_with_parens(self):
        """Test valid phone number with parentheses."""
        result = validate_phone("(555) 123-4567")

        assert result["is_valid"] is True

    def test_valid_phone_with_country_code(self):
        """Test valid phone number with +1."""
        result = validate_phone("+15551234567")

        assert result["is_valid"] is True

    def test_invalid_phone_too_short(self):
        """Test invalid phone number too short."""
        result = validate_phone("555123")

        assert result["is_valid"] is False

    def test_invalid_phone_too_long(self):
        """Test invalid phone number too long."""
        result = validate_phone("55512345678901")

        assert result["is_valid"] is False


class TestGenerateReferenceNumber:
    """Tests for generate_reference_number function."""

    def test_default_prefix(self):
        """Test default prefix."""
        result = generate_reference_number()

        assert result.startswith("REF-")

    def test_custom_prefix(self):
        """Test custom prefix."""
        result = generate_reference_number("TKT")

        assert result.startswith("TKT-")

    def test_unique_numbers(self):
        """Test numbers are likely unique (may have rare collisions due to random)."""
        numbers = [generate_reference_number() for _ in range(100)]

        # Should have high uniqueness (allow for rare random collisions)
        unique_count = len(set(numbers))
        assert unique_count >= 90  # Allow up to 10% collision rate

    def test_format_structure(self):
        """Test reference number format."""
        result = generate_reference_number("TEST")

        parts = result.split("-")
        assert len(parts) == 3
        assert parts[0] == "TEST"
        assert len(parts[1]) == 14  # YYYYMMDDHHmmss
        assert len(parts[2]) == 4  # Random suffix


class TestCalculateBusinessHours:
    """Tests for calculate_business_hours function."""

    def test_same_day(self):
        """Test hours calculation within same day."""
        result = calculate_business_hours(
            "2024-01-15T09:00:00",
            "2024-01-15T17:00:00",
        )

        assert result["total_hours"] == 8.0

    def test_multi_day(self):
        """Test hours calculation across multiple days."""
        result = calculate_business_hours(
            "2024-01-15T09:00:00",
            "2024-01-16T09:00:00",
        )

        assert result["total_hours"] == 24.0
        assert "estimated_business_hours" in result

    def test_invalid_format(self):
        """Test invalid datetime format."""
        result = calculate_business_hours("invalid", "2024-01-15")

        assert "error" in result


class TestSanitizeInput:
    """Tests for sanitize_input function."""

    def test_normal_text(self):
        """Test normal text passes through."""
        result = sanitize_input("Hello, World!")

        assert result == "Hello, World!"

    def test_strips_whitespace(self):
        """Test leading/trailing whitespace stripped."""
        result = sanitize_input("  Hello  ")

        assert result == "Hello"

    def test_removes_control_characters(self):
        """Test control characters are removed."""
        result = sanitize_input("Hello\x00World")

        assert result == "HelloWorld"

    def test_preserves_newlines(self):
        """Test newlines are preserved."""
        result = sanitize_input("Hello\nWorld")

        assert result == "Hello\nWorld"

    def test_preserves_tabs(self):
        """Test tabs are preserved."""
        result = sanitize_input("Hello\tWorld")

        assert result == "Hello\tWorld"

    def test_truncates_long_text(self):
        """Test long text is truncated."""
        long_text = "a" * 2000
        result = sanitize_input(long_text, max_length=100)

        assert len(result) == 103  # 100 + "..."
        assert result.endswith("...")

    def test_custom_max_length(self):
        """Test custom max length."""
        result = sanitize_input("Hello World", max_length=5)

        assert result == "Hello..."
