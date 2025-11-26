"""
Common Tools for Agent Templates.

Provides utility functions that can be wrapped as FunctionTools
and shared across multiple agent templates.
"""

from datetime import datetime
import random
import re


def get_current_datetime() -> dict:
    """
    Get the current date and time.

    Returns:
        Dictionary with formatted date, time, and ISO timestamp
    """
    now = datetime.now()
    return {
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M:%S"),
        "day_of_week": now.strftime("%A"),
        "iso_timestamp": now.isoformat(),
    }


def format_date(date_str: str, output_format: str = "%B %d, %Y") -> str:
    """
    Format a date string to a more readable format.

    Args:
        date_str: Date string in YYYY-MM-DD format
        output_format: Desired output format (strftime)

    Returns:
        Formatted date string
    """
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d")
        return date.strftime(output_format)
    except ValueError:
        return f"Invalid date format: {date_str}"


def format_time(time_str: str, include_ampm: bool = True) -> str:
    """
    Format a time string to 12-hour format.

    Args:
        time_str: Time string in HH:MM format
        include_ampm: Whether to include AM/PM

    Returns:
        Formatted time string
    """
    try:
        time = datetime.strptime(time_str, "%H:%M")
        if include_ampm:
            return time.strftime("%I:%M %p")
        return time.strftime("%I:%M")
    except ValueError:
        return f"Invalid time format: {time_str}"


def validate_email(email: str) -> dict:
    """
    Validate an email address format.

    Args:
        email: Email address to validate

    Returns:
        Dictionary with validation result
    """
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    is_valid = bool(re.match(pattern, email))

    return {
        "email": email,
        "is_valid": is_valid,
        "message": "Valid email format" if is_valid else "Invalid email format",
    }


def validate_phone(phone: str) -> dict:
    """
    Validate a phone number format (US formats).

    Args:
        phone: Phone number to validate

    Returns:
        Dictionary with validation result and normalized format
    """
    # Remove common separators
    digits = re.sub(r"[\s\-\.\(\)]", "", phone)

    # Check for valid US phone number (10 digits, optionally with +1)
    if digits.startswith("+1"):
        digits = digits[2:]
    elif digits.startswith("1") and len(digits) == 11:
        digits = digits[1:]

    is_valid = len(digits) == 10 and digits.isdigit()

    if is_valid:
        formatted = f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    else:
        formatted = phone

    return {
        "original": phone,
        "normalized": formatted,
        "is_valid": is_valid,
        "message": "Valid phone number" if is_valid else "Invalid phone number format",
    }


def generate_reference_number(prefix: str = "REF") -> str:
    """
    Generate a unique reference number.

    Args:
        prefix: Prefix for the reference number (e.g., "CONF", "TKT")

    Returns:
        Unique reference number string
    """
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = random.randint(1000, 9999)
    return f"{prefix}-{timestamp}-{random_suffix}"


def calculate_business_hours(
    start_datetime: str,
    end_datetime: str,
    work_start: str = "09:00",
    work_end: str = "17:00",
) -> dict:
    """
    Calculate business hours between two datetimes.

    Args:
        start_datetime: Start datetime in ISO format
        end_datetime: End datetime in ISO format
        work_start: Work day start time (HH:MM)
        work_end: Work day end time (HH:MM)

    Returns:
        Dictionary with hours calculation
    """
    try:
        start = datetime.fromisoformat(start_datetime)
        end = datetime.fromisoformat(end_datetime)

        # Simple calculation - doesn't account for weekends/holidays
        total_hours = (end - start).total_seconds() / 3600

        # Rough estimate of business hours (8 hours per day)
        work_hours_per_day = 8
        days = total_hours / 24
        business_hours = days * work_hours_per_day

        return {
            "total_hours": round(total_hours, 2),
            "estimated_business_hours": round(business_hours, 2),
            "note": "Estimate based on 8-hour workday, excludes weekends/holidays",
        }
    except ValueError as e:
        return {"error": f"Invalid datetime format: {e}"}


def sanitize_input(text: str, max_length: int = 1000) -> str:
    """
    Sanitize user input by removing potentially harmful content.

    Args:
        text: Input text to sanitize
        max_length: Maximum allowed length

    Returns:
        Sanitized text
    """
    # Remove control characters
    text = "".join(char for char in text if ord(char) >= 32 or char in "\n\t")

    # Truncate to max length
    if len(text) > max_length:
        text = text[:max_length] + "..."

    return text.strip()
