"""
Workers Module - Background Job Processing.

This module provides background job processing for long-running tasks:
- Agent execution (async)
- Email notifications
- Cleanup tasks
- Report generation

Architecture:
- TaskQueue: Simple async task queue for local development
- In production, use Cloud Tasks or Celery with Redis

Usage:
    from src.workers import task_queue, enqueue_task

    # Enqueue a task
    task_id = await enqueue_task(
        "agent_execution",
        tenant_id="...",
        agent_id="...",
        message="..."
    )

    # Check task status
    status = await task_queue.get_task_status(task_id)
"""

from src.workers.queue import TaskQueue, TaskResult, TaskStatus, get_task_queue
from src.workers.tasks import TaskType, enqueue_task

__all__ = [
    "TaskQueue",
    "TaskStatus",
    "TaskResult",
    "TaskType",
    "get_task_queue",
    "enqueue_task",
]
