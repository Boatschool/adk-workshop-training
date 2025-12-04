"""Tests for email service."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.services.email_service import (
    EmailMessage,
    EmailProvider,
    EmailService,
    send_password_reset_email,
    send_welcome_email,
)


class TestEmailMessage:
    """Tests for EmailMessage dataclass."""

    def test_create_message(self):
        """Test creating an email message."""
        message = EmailMessage(
            to="user@example.com",
            subject="Test Subject",
            body="Test body",
        )

        assert message.to == "user@example.com"
        assert message.subject == "Test Subject"
        assert message.body == "Test body"
        assert message.html_body is None

    def test_create_message_with_html(self):
        """Test creating message with HTML body."""
        message = EmailMessage(
            to=["user1@example.com", "user2@example.com"],
            subject="HTML Test",
            body="Plain text",
            html_body="<html><body>HTML content</body></html>",
        )

        assert isinstance(message.to, list)
        assert message.html_body is not None


class TestEmailProvider:
    """Tests for EmailProvider enum."""

    def test_provider_values(self):
        """Test provider enum values."""
        assert EmailProvider.SMTP.value == "smtp"
        assert EmailProvider.SENDGRID.value == "sendgrid"
        assert EmailProvider.MAILGUN.value == "mailgun"
        assert EmailProvider.CONSOLE.value == "console"


class TestEmailService:
    """Tests for EmailService class."""

    @pytest.fixture
    def email_service(self):
        """Create email service with console provider."""
        return EmailService(provider=EmailProvider.CONSOLE)

    def test_default_provider(self):
        """Test default provider detection."""
        service = EmailService()

        # Should default to console in dev
        assert service.provider == EmailProvider.CONSOLE

    def test_explicit_provider(self):
        """Test explicit provider setting."""
        service = EmailService(provider=EmailProvider.SMTP)

        assert service.provider == EmailProvider.SMTP

    @pytest.mark.asyncio
    async def test_send_console(self, email_service, caplog):
        """Test sending email in console mode."""
        import logging

        with caplog.at_level(logging.INFO):
            result = await email_service.send(
                to="user@example.com",
                subject="Test Email",
                body="This is a test email body.",
            )

        assert result is True
        assert "Test Email" in caplog.text
        assert "user@example.com" in caplog.text

    @pytest.mark.asyncio
    async def test_send_to_multiple_recipients(self, email_service, caplog):
        """Test sending to multiple recipients."""
        import logging

        with caplog.at_level(logging.INFO):
            result = await email_service.send(
                to=["user1@example.com", "user2@example.com"],
                subject="Multi-recipient Test",
                body="Test body",
            )

        assert result is True
        assert "user1@example.com" in caplog.text

    @pytest.mark.asyncio
    async def test_send_template_welcome(self, email_service, caplog):
        """Test sending welcome template."""
        import logging

        with caplog.at_level(logging.INFO):
            result = await email_service.send_template(
                to="newuser@example.com",
                template="welcome",
                variables={"name": "John Doe"},
            )

        assert result is True
        assert "John Doe" in caplog.text
        assert "Welcome to ADK Platform" in caplog.text

    @pytest.mark.asyncio
    async def test_send_template_password_reset(self, email_service, caplog):
        """Test sending password reset template."""
        import logging

        with caplog.at_level(logging.INFO):
            result = await email_service.send_template(
                to="user@example.com",
                template="password_reset",
                variables={
                    "name": "Jane",
                    "reset_link": "https://example.com/reset/abc123",
                    "expiry_hours": 24,
                },
            )

        assert result is True
        assert "Jane" in caplog.text
        assert "reset" in caplog.text.lower()

    @pytest.mark.asyncio
    async def test_send_template_unknown(self, email_service):
        """Test sending unknown template."""
        result = await email_service.send_template(
            to="user@example.com",
            template="unknown_template",
            variables={},
        )

        assert result is False

    @pytest.mark.asyncio
    async def test_send_template_with_subject_override(self, email_service, caplog):
        """Test template with subject override."""
        import logging

        with caplog.at_level(logging.INFO):
            result = await email_service.send_template(
                to="user@example.com",
                template="welcome",
                variables={"name": "Test"},
                subject="Custom Subject Override",
            )

        assert result is True
        assert "Custom Subject Override" in caplog.text


class TestEmailConvenienceFunctions:
    """Tests for convenience email functions."""

    @pytest.mark.asyncio
    async def test_send_welcome_email(self, caplog):
        """Test send_welcome_email function."""
        import logging

        with caplog.at_level(logging.INFO):
            result = await send_welcome_email(
                to="new@example.com",
                name="New User",
            )

        assert result is True
        assert "New User" in caplog.text

    @pytest.mark.asyncio
    async def test_send_password_reset_email(self, caplog):
        """Test send_password_reset_email function."""
        import logging

        with caplog.at_level(logging.INFO):
            result = await send_password_reset_email(
                to="user@example.com",
                name="Test User",
                reset_link="https://example.com/reset/token123",
                expiry_hours=48,
            )

        assert result is True
        assert "Test User" in caplog.text


class TestEmailServiceProviders:
    """Tests for different email provider implementations."""

    @pytest.mark.asyncio
    async def test_smtp_send(self):
        """Test SMTP sending (mocked)."""
        pytest.importorskip("aiosmtplib")

        service = EmailService(provider=EmailProvider.SMTP)

        # Mock the SMTP send
        with patch("aiosmtplib.send", new_callable=AsyncMock) as mock_send:
            mock_send.return_value = None

            message = EmailMessage(
                to=["test@example.com"],
                subject="SMTP Test",
                body="Test body",
                from_email="sender@example.com",
            )

            result = await service._send_smtp(message)

            # Should attempt to send
            mock_send.assert_called_once()

    @pytest.mark.asyncio
    async def test_sendgrid_send(self):
        """Test SendGrid sending (mocked)."""
        with patch.object(EmailService, "_detect_provider", return_value=EmailProvider.SENDGRID):
            service = EmailService(provider=EmailProvider.SENDGRID)
            service.settings = MagicMock(sendgrid_api_key="test_key")

            # Mock httpx
            mock_response = MagicMock()
            mock_response.status_code = 202

            with patch("httpx.AsyncClient") as mock_client:
                mock_client_instance = AsyncMock()
                mock_client_instance.post.return_value = mock_response
                mock_client.return_value.__aenter__.return_value = mock_client_instance

                message = EmailMessage(
                    to=["test@example.com"],
                    subject="SendGrid Test",
                    body="Test body",
                    from_email="sender@example.com",
                )

                result = await service._send_sendgrid(message)

                assert result is True

    @pytest.mark.asyncio
    async def test_sendgrid_send_failure(self):
        """Test SendGrid error handling."""
        with patch.object(EmailService, "_detect_provider", return_value=EmailProvider.SENDGRID):
            service = EmailService(provider=EmailProvider.SENDGRID)
            service.settings = MagicMock(sendgrid_api_key="test_key")

            mock_response = MagicMock()
            mock_response.status_code = 400
            mock_response.text = "Bad Request"

            with patch("httpx.AsyncClient") as mock_client:
                mock_client_instance = AsyncMock()
                mock_client_instance.post.return_value = mock_response
                mock_client.return_value.__aenter__.return_value = mock_client_instance

                message = EmailMessage(
                    to=["test@example.com"],
                    subject="Test",
                    body="Test",
                    from_email="sender@example.com",
                )

                result = await service._send_sendgrid(message)

                assert result is False
