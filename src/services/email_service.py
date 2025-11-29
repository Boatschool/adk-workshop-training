"""
Email Service - Email notification handling.

Provides email sending capabilities with:
- Plain text and HTML emails
- Template-based emails
- Async sending via background tasks
- Support for multiple providers (SMTP, SendGrid, Mailgun)

In production, configure with a real email provider.
"""

import logging
from dataclasses import dataclass
from enum import Enum
from typing import Any

from src.core.config import get_settings

logger = logging.getLogger(__name__)


class EmailProvider(str, Enum):
    """Supported email providers."""

    SMTP = "smtp"
    SENDGRID = "sendgrid"
    MAILGUN = "mailgun"
    CONSOLE = "console"  # For development - logs to console


@dataclass
class EmailMessage:
    """Email message data."""

    to: str | list[str]
    subject: str
    body: str
    html_body: str | None = None
    from_email: str | None = None
    reply_to: str | None = None
    cc: list[str] | None = None
    bcc: list[str] | None = None
    attachments: list[dict] | None = None


class EmailService:
    """Service for sending emails.

    Supports multiple providers and template-based emails.
    Defaults to console output in development mode.

    Usage:
        service = EmailService()

        # Simple email
        await service.send(
            to="user@example.com",
            subject="Welcome!",
            body="Welcome to our platform."
        )

        # Template email
        await service.send_template(
            to="user@example.com",
            subject="Welcome!",
            template="welcome",
            variables={"name": "John"}
        )
    """

    # Email templates (in production, load from files or database)
    TEMPLATES = {
        "welcome": {
            "subject": "Welcome to ADK Platform",
            "body": """
Hello {name},

Welcome to ADK Platform! We're excited to have you on board.

To get started:
1. Log in to your dashboard
2. Create your first AI agent
3. Explore the workshop exercises

If you have any questions, our support team is here to help.

Best regards,
The ADK Platform Team
""",
            "html_body": """
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #333;">Welcome to ADK Platform</h1>
    <p>Hello {name},</p>
    <p>Welcome to ADK Platform! We're excited to have you on board.</p>
    <h3>To get started:</h3>
    <ol>
        <li>Log in to your dashboard</li>
        <li>Create your first AI agent</li>
        <li>Explore the workshop exercises</li>
    </ol>
    <p>If you have any questions, our support team is here to help.</p>
    <p>Best regards,<br>The ADK Platform Team</p>
</body>
</html>
""",
        },
        "password_reset": {
            "subject": "Password Reset Request",
            "body": """
Hello {name},

We received a request to reset your password.

Click the link below to reset your password:
{reset_link}

This link will expire in {expiry_hours} hours.

If you didn't request this, you can safely ignore this email.

Best regards,
The ADK Platform Team
""",
            "html_body": """
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #333;">Password Reset Request</h1>
    <p>Hello {name},</p>
    <p>We received a request to reset your password.</p>
    <p>
        <a href="{reset_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
        </a>
    </p>
    <p><small>This link will expire in {expiry_hours} hours.</small></p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>Best regards,<br>The ADK Platform Team</p>
</body>
</html>
""",
        },
        "workshop_invitation": {
            "subject": "You're Invited to a Workshop",
            "body": """
Hello {name},

You've been invited to join the workshop: {workshop_title}

Workshop Details:
- Title: {workshop_title}
- Instructor: {instructor_name}
- Start Date: {start_date}

Click the link below to join:
{join_link}

Best regards,
The ADK Platform Team
""",
            "html_body": None,  # Use plain text
        },
        "agent_execution_complete": {
            "subject": "Agent Execution Complete",
            "body": """
Hello {name},

Your agent execution has completed.

Agent: {agent_name}
Status: {status}
Execution Time: {execution_time_ms}ms

{result_summary}

Best regards,
The ADK Platform Team
""",
            "html_body": None,
        },
    }

    def __init__(self, provider: EmailProvider | None = None):
        """Initialize email service.

        Args:
            provider: Email provider to use (defaults to console in dev)
        """
        self.settings = get_settings()
        self.provider = provider or self._detect_provider()
        self.from_email = getattr(self.settings, "email_from", "noreply@adk-platform.com")

        logger.info(f"EmailService initialized with provider: {self.provider}")

    def _detect_provider(self) -> EmailProvider:
        """Detect which email provider to use based on settings."""
        # Check for configured providers
        if hasattr(self.settings, "sendgrid_api_key") and self.settings.sendgrid_api_key:
            return EmailProvider.SENDGRID

        if hasattr(self.settings, "mailgun_api_key") and self.settings.mailgun_api_key:
            return EmailProvider.MAILGUN

        if hasattr(self.settings, "smtp_host") and self.settings.smtp_host:
            return EmailProvider.SMTP

        # Default to console for development
        return EmailProvider.CONSOLE

    async def send(
        self,
        to: str | list[str],
        subject: str,
        body: str,
        html_body: str | None = None,
        from_email: str | None = None,
        reply_to: str | None = None,
        cc: list[str] | None = None,
        bcc: list[str] | None = None,
    ) -> bool:
        """Send an email.

        Args:
            to: Recipient email address(es)
            subject: Email subject
            body: Plain text body
            html_body: Optional HTML body
            from_email: Sender email (defaults to configured)
            reply_to: Reply-to address
            cc: CC recipients
            bcc: BCC recipients

        Returns:
            True if sent successfully
        """
        message = EmailMessage(
            to=to if isinstance(to, list) else [to],
            subject=subject,
            body=body,
            html_body=html_body,
            from_email=from_email or self.from_email,
            reply_to=reply_to,
            cc=cc,
            bcc=bcc,
        )

        return await self._send_message(message)

    async def send_template(
        self,
        to: str | list[str],
        template: str,
        variables: dict[str, Any],
        subject: str | None = None,
        from_email: str | None = None,
    ) -> bool:
        """Send a template-based email.

        Args:
            to: Recipient email address(es)
            template: Template name
            variables: Template variables
            subject: Override template subject
            from_email: Sender email

        Returns:
            True if sent successfully
        """
        if template not in self.TEMPLATES:
            logger.error(f"Unknown email template: {template}")
            return False

        tpl = self.TEMPLATES[template]

        # Render template
        rendered_subject = (subject or tpl["subject"]).format(**variables)
        rendered_body = tpl["body"].format(**variables)
        rendered_html = None
        if tpl.get("html_body"):
            rendered_html = tpl["html_body"].format(**variables)

        return await self.send(
            to=to,
            subject=rendered_subject,
            body=rendered_body,
            html_body=rendered_html,
            from_email=from_email,
        )

    async def _send_message(self, message: EmailMessage) -> bool:
        """Send message using configured provider.

        Args:
            message: Email message to send

        Returns:
            True if successful
        """
        try:
            if self.provider == EmailProvider.CONSOLE:
                return await self._send_console(message)
            elif self.provider == EmailProvider.SMTP:
                return await self._send_smtp(message)
            elif self.provider == EmailProvider.SENDGRID:
                return await self._send_sendgrid(message)
            elif self.provider == EmailProvider.MAILGUN:
                return await self._send_mailgun(message)
            else:
                logger.error(f"Unknown email provider: {self.provider}")
                return False

        except Exception as e:
            logger.exception(f"Failed to send email: {e}")
            return False

    async def _send_console(self, message: EmailMessage) -> bool:
        """Log email to console (development mode).

        Args:
            message: Email message

        Returns:
            Always True
        """
        recipients = ", ".join(message.to) if isinstance(message.to, list) else message.to

        logger.info(
            f"\n{'='*60}\n"
            f"EMAIL (Console Mode)\n"
            f"{'='*60}\n"
            f"From: {message.from_email}\n"
            f"To: {recipients}\n"
            f"Subject: {message.subject}\n"
            f"{'-'*60}\n"
            f"{message.body}\n"
            f"{'='*60}\n"
        )

        return True

    async def _send_smtp(self, message: EmailMessage) -> bool:
        """Send email via SMTP.

        Args:
            message: Email message

        Returns:
            True if successful
        """
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText

        import aiosmtplib

        msg = MIMEMultipart("alternative")
        msg["Subject"] = message.subject
        msg["From"] = message.from_email
        msg["To"] = ", ".join(message.to)

        if message.cc:
            msg["Cc"] = ", ".join(message.cc)
        if message.reply_to:
            msg["Reply-To"] = message.reply_to

        # Attach plain text
        msg.attach(MIMEText(message.body, "plain"))

        # Attach HTML if provided
        if message.html_body:
            msg.attach(MIMEText(message.html_body, "html"))

        # Send
        await aiosmtplib.send(
            msg,
            hostname=self.settings.smtp_host,
            port=getattr(self.settings, "smtp_port", 587),
            username=getattr(self.settings, "smtp_username", None),
            password=getattr(self.settings, "smtp_password", None),
            use_tls=getattr(self.settings, "smtp_use_tls", True),
        )

        logger.info(f"Email sent via SMTP to {message.to}")
        return True

    async def _send_sendgrid(self, message: EmailMessage) -> bool:
        """Send email via SendGrid.

        Args:
            message: Email message

        Returns:
            True if successful
        """
        import httpx

        recipients = [{"email": addr} for addr in message.to]

        payload = {
            "personalizations": [{"to": recipients}],
            "from": {"email": message.from_email},
            "subject": message.subject,
            "content": [{"type": "text/plain", "value": message.body}],
        }

        if message.html_body:
            payload["content"].append({"type": "text/html", "value": message.html_body})

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.settings.sendgrid_api_key}",
                    "Content-Type": "application/json",
                },
            )

        if response.status_code in (200, 201, 202):
            logger.info(f"Email sent via SendGrid to {message.to}")
            return True

        logger.error(f"SendGrid error: {response.status_code} - {response.text}")
        return False

    async def _send_mailgun(self, message: EmailMessage) -> bool:
        """Send email via Mailgun.

        Args:
            message: Email message

        Returns:
            True if successful
        """
        import httpx

        domain = getattr(self.settings, "mailgun_domain", "")

        data = {
            "from": message.from_email,
            "to": message.to,
            "subject": message.subject,
            "text": message.body,
        }

        if message.html_body:
            data["html"] = message.html_body

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api.mailgun.net/v3/{domain}/messages",
                auth=("api", self.settings.mailgun_api_key),
                data=data,
            )

        if response.status_code == 200:
            logger.info(f"Email sent via Mailgun to {message.to}")
            return True

        logger.error(f"Mailgun error: {response.status_code} - {response.text}")
        return False


# Convenience functions


async def send_welcome_email(to: str, name: str) -> bool:
    """Send welcome email to new user.

    Args:
        to: User email
        name: User's name

    Returns:
        True if sent
    """
    service = EmailService()
    return await service.send_template(
        to=to,
        template="welcome",
        variables={"name": name},
    )


async def send_password_reset_email(
    to: str,
    name: str,
    reset_link: str,
    expiry_hours: int = 24,
) -> bool:
    """Send password reset email.

    Args:
        to: User email
        name: User's name
        reset_link: Password reset URL
        expiry_hours: Link expiry time

    Returns:
        True if sent
    """
    service = EmailService()
    return await service.send_template(
        to=to,
        template="password_reset",
        variables={
            "name": name,
            "reset_link": reset_link,
            "expiry_hours": expiry_hours,
        },
    )


async def send_workshop_invitation(
    to: str,
    name: str,
    workshop_title: str,
    instructor_name: str,
    start_date: str,
    join_link: str,
) -> bool:
    """Send workshop invitation email.

    Args:
        to: User email
        name: User's name
        workshop_title: Workshop title
        instructor_name: Instructor's name
        start_date: Workshop start date
        join_link: Link to join workshop

    Returns:
        True if sent
    """
    service = EmailService()
    return await service.send_template(
        to=to,
        template="workshop_invitation",
        variables={
            "name": name,
            "workshop_title": workshop_title,
            "instructor_name": instructor_name,
            "start_date": start_date,
            "join_link": join_link,
        },
    )
