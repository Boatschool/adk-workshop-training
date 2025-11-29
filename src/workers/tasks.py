"""
Task Definitions - Pre-defined background tasks.

Registers handlers for common background operations:
- Agent execution
- Email notifications
- Cleanup tasks
"""

import logging
from enum import Enum
from typing import Any

from src.workers.queue import TaskResult, get_task_queue

logger = logging.getLogger(__name__)

# Get the singleton queue
_queue = get_task_queue()


class TaskType(str, Enum):
    """Predefined task types."""

    AGENT_EXECUTION = "agent_execution"
    SEND_EMAIL = "send_email"
    CLEANUP_SESSIONS = "cleanup_sessions"
    GENERATE_REPORT = "generate_report"


# NOTE: Agent execution task disabled - the custom src/agents framework was not
# compliant with Google ADK v1.18.0 and has been archived.
# See: _archive/deprecated-non-adk-compliant/ for the original implementation.
# To re-enable, implement an ADK v1.18.0 compliant runner using InMemoryRunner.
#
# @_queue.register(TaskType.AGENT_EXECUTION.value)
# async def execute_agent_task(...): ...


async def execute_agent_task(
    tenant_id: str,
    user_id: str,
    agent_type: str,
    message: str,
    agent_id: str | None = None,
    config_override: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Execute an agent in the background.

    NOTE: This task is currently disabled. The custom agent framework was not
    compliant with Google ADK v1.18.0.

    For agent execution, use the Visual Builder at http://localhost:8000/dev-ui

    Args:
        tenant_id: Tenant identifier
        user_id: User performing the request
        agent_type: Type of agent to execute
        message: User message
        agent_id: Optional saved agent ID
        config_override: Optional config overrides

    Returns:
        Error response indicating the feature is disabled
    """
    return {
        "success": False,
        "error": "Agent execution via background tasks is currently disabled. "
        "The custom agent framework was not ADK v1.18.0 compliant. "
        "Use the Visual Builder at http://localhost:8000/dev-ui instead.",
        "tenant_id": tenant_id,
        "agent_type": agent_type,
    }


@_queue.register(TaskType.SEND_EMAIL.value)
async def send_email_task(
    to: str,
    subject: str,
    body: str,
    template: str | None = None,
    template_vars: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Send an email in the background.

    Args:
        to: Recipient email address
        subject: Email subject
        body: Plain text body (or HTML if template not provided)
        template: Optional template name
        template_vars: Variables for template rendering

    Returns:
        Send status
    """
    from src.services.email_service import EmailService

    service = EmailService()

    if template:
        success = await service.send_template(
            to=to,
            subject=subject,
            template=template,
            variables=template_vars or {},
        )
    else:
        success = await service.send(
            to=to,
            subject=subject,
            body=body,
        )

    return {
        "success": success,
        "to": to,
        "subject": subject,
    }


@_queue.register(TaskType.CLEANUP_SESSIONS.value)
async def cleanup_sessions_task(
    max_age_hours: int = 24,
) -> dict[str, Any]:
    """Clean up expired sessions.

    Args:
        max_age_hours: Maximum session age in hours

    Returns:
        Cleanup statistics
    """
    # In production, would clean up database sessions
    # For now, just clean up task queue
    queue = get_task_queue()
    removed = await queue.cleanup_completed(max_age_seconds=max_age_hours * 3600)

    return {
        "tasks_removed": removed,
        "max_age_hours": max_age_hours,
    }


@_queue.register(TaskType.GENERATE_REPORT.value)
async def generate_report_task(
    tenant_id: str,
    report_type: str,
    start_date: str | None = None,
    end_date: str | None = None,
    filters: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Generate a report in the background.

    Args:
        tenant_id: Tenant identifier
        report_type: Type of report (usage, progress, etc.)
        start_date: Report start date
        end_date: Report end date
        filters: Additional filters

    Returns:
        Report data or storage location
    """
    logger.info(
        f"Generating report: {report_type}",
        extra={
            "tenant_id": tenant_id,
            "start_date": start_date,
            "end_date": end_date,
        },
    )

    # Placeholder - implement actual report generation
    return {
        "report_type": report_type,
        "tenant_id": tenant_id,
        "status": "generated",
        "message": "Report generation not yet implemented",
    }


async def enqueue_task(
    task_type: str | TaskType,
    delay_seconds: int = 0,
    **kwargs: Any,
) -> str:
    """Convenience function to enqueue a task.

    Args:
        task_type: Task type (string or TaskType enum)
        delay_seconds: Optional delay before execution
        **kwargs: Task-specific arguments

    Returns:
        Task ID for tracking
    """
    if isinstance(task_type, TaskType):
        task_type = task_type.value

    queue = get_task_queue()
    return await queue.enqueue(task_type, delay_seconds=delay_seconds, **kwargs)


async def get_task_result(task_id: str) -> TaskResult | None:
    """Get task result by ID.

    Args:
        task_id: Task identifier

    Returns:
        TaskResult or None
    """
    queue = get_task_queue()
    return await queue.get_task_status(task_id)
