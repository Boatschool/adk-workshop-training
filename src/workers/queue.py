"""
Task Queue - Async background job processing.

Provides a simple in-memory task queue for development.
In production, replace with Cloud Tasks or Celery.
"""

import asyncio
import logging
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Coroutine

logger = logging.getLogger(__name__)


class TaskStatus(str, Enum):
    """Task execution status."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class TaskResult:
    """Result of a task execution.

    Attributes:
        task_id: Unique task identifier
        status: Current task status
        result: Task result data (if completed)
        error: Error message (if failed)
        created_at: When task was created
        started_at: When execution started
        completed_at: When execution finished
        metadata: Additional task metadata
    """

    task_id: str
    status: TaskStatus
    result: Any = None
    error: str | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    started_at: datetime | None = None
    completed_at: datetime | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "task_id": self.task_id,
            "status": self.status.value,
            "result": self.result,
            "error": self.error,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "metadata": self.metadata,
        }

    @property
    def execution_time_ms(self) -> int | None:
        """Calculate execution time in milliseconds."""
        if self.started_at and self.completed_at:
            delta = self.completed_at - self.started_at
            return int(delta.total_seconds() * 1000)
        return None


# Type alias for async task handlers
TaskHandler = Callable[..., Coroutine[Any, Any, Any]]


class TaskQueue:
    """Simple async task queue for background job processing.

    This is a development-friendly implementation using asyncio.
    For production, consider using:
    - Google Cloud Tasks (serverless, GCP-native)
    - Celery with Redis (self-managed, more features)
    - Dramatiq (simpler alternative to Celery)

    Usage:
        queue = TaskQueue()

        # Register a handler
        @queue.register("my_task")
        async def handle_my_task(arg1, arg2):
            return {"result": arg1 + arg2}

        # Enqueue a task
        task_id = await queue.enqueue("my_task", arg1=1, arg2=2)

        # Check status
        result = await queue.get_task_status(task_id)
    """

    _instance: "TaskQueue | None" = None

    def __new__(cls) -> "TaskQueue":
        """Singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        """Initialize the task queue."""
        if getattr(self, "_initialized", False):
            return

        self._initialized = True
        self._handlers: dict[str, TaskHandler] = {}
        self._tasks: dict[str, TaskResult] = {}
        self._running_tasks: dict[str, asyncio.Task] = {}
        self._max_concurrent = 10
        self._semaphore = asyncio.Semaphore(self._max_concurrent)

        logger.info("TaskQueue initialized (in-memory mode)")

    def register(self, task_type: str) -> Callable[[TaskHandler], TaskHandler]:
        """Register a task handler.

        Can be used as a decorator:
            @queue.register("my_task")
            async def handler(arg):
                ...

        Args:
            task_type: Unique task type identifier

        Returns:
            Decorator function
        """
        def decorator(handler: TaskHandler) -> TaskHandler:
            self._handlers[task_type] = handler
            logger.debug(f"Registered task handler: {task_type}")
            return handler

        return decorator

    async def enqueue(
        self,
        task_type: str,
        delay_seconds: int = 0,
        **kwargs: Any,
    ) -> str:
        """Enqueue a task for background execution.

        Args:
            task_type: Type of task to execute
            delay_seconds: Optional delay before execution
            **kwargs: Arguments to pass to the handler

        Returns:
            Task ID for tracking

        Raises:
            ValueError: If task type is not registered
        """
        if task_type not in self._handlers:
            raise ValueError(f"Unknown task type: {task_type}")

        task_id = str(uuid.uuid4())

        # Create task result entry
        self._tasks[task_id] = TaskResult(
            task_id=task_id,
            status=TaskStatus.PENDING,
            metadata={
                "task_type": task_type,
                "kwargs": kwargs,
                "delay_seconds": delay_seconds,
            },
        )

        # Schedule execution and track the task
        task = asyncio.create_task(
            self._execute_task(task_id, task_type, delay_seconds, kwargs)
        )
        self._running_tasks[task_id] = task

        # Clean up task reference when done
        task.add_done_callback(lambda _: self._running_tasks.pop(task_id, None))

        logger.info(
            f"Task enqueued: {task_id}",
            extra={"task_type": task_type, "delay_seconds": delay_seconds},
        )

        return task_id

    async def _execute_task(
        self,
        task_id: str,
        task_type: str,
        delay_seconds: int,
        kwargs: dict[str, Any],
    ) -> None:
        """Execute a task with concurrency control."""
        # Apply delay if specified
        if delay_seconds > 0:
            await asyncio.sleep(delay_seconds)

        # Acquire semaphore for concurrency control
        async with self._semaphore:
            task_result = self._tasks[task_id]
            task_result.status = TaskStatus.RUNNING
            task_result.started_at = datetime.utcnow()

            try:
                handler = self._handlers[task_type]
                result = await handler(**kwargs)

                task_result.status = TaskStatus.COMPLETED
                task_result.result = result
                task_result.completed_at = datetime.utcnow()

                logger.info(
                    f"Task completed: {task_id}",
                    extra={
                        "task_type": task_type,
                        "execution_time_ms": task_result.execution_time_ms,
                    },
                )

            except asyncio.CancelledError:
                task_result.status = TaskStatus.CANCELLED
                task_result.completed_at = datetime.utcnow()
                logger.warning(f"Task cancelled: {task_id}")

            except Exception as e:
                task_result.status = TaskStatus.FAILED
                task_result.error = str(e)
                task_result.completed_at = datetime.utcnow()

                logger.exception(
                    f"Task failed: {task_id}",
                    extra={"task_type": task_type, "error": str(e)},
                )

    async def get_task_status(self, task_id: str) -> TaskResult | None:
        """Get the current status of a task.

        Args:
            task_id: Task identifier

        Returns:
            TaskResult or None if not found
        """
        return self._tasks.get(task_id)

    async def cancel_task(self, task_id: str) -> bool:
        """Cancel a pending or running task.

        Args:
            task_id: Task identifier

        Returns:
            True if cancelled, False if not found or already completed
        """
        if task_id not in self._tasks:
            return False

        task_result = self._tasks[task_id]

        if task_result.status in (TaskStatus.COMPLETED, TaskStatus.FAILED):
            return False

        if task_id in self._running_tasks:
            self._running_tasks[task_id].cancel()
            del self._running_tasks[task_id]

        task_result.status = TaskStatus.CANCELLED
        task_result.completed_at = datetime.utcnow()

        return True

    async def wait_for_task(
        self,
        task_id: str,
        timeout: float = 60.0,
        poll_interval: float = 0.1,
    ) -> TaskResult | None:
        """Wait for a task to complete.

        Args:
            task_id: Task identifier
            timeout: Maximum wait time in seconds
            poll_interval: Time between status checks

        Returns:
            Final TaskResult or None if timeout
        """
        start_time = asyncio.get_event_loop().time()

        while True:
            result = await self.get_task_status(task_id)

            if result is None:
                return None

            if result.status in (
                TaskStatus.COMPLETED,
                TaskStatus.FAILED,
                TaskStatus.CANCELLED,
            ):
                return result

            elapsed = asyncio.get_event_loop().time() - start_time
            if elapsed >= timeout:
                return result

            await asyncio.sleep(poll_interval)

    def list_tasks(
        self,
        status: TaskStatus | None = None,
        limit: int = 100,
    ) -> list[TaskResult]:
        """List tasks with optional filtering.

        Args:
            status: Filter by status
            limit: Maximum results

        Returns:
            List of TaskResult objects
        """
        tasks = list(self._tasks.values())

        if status:
            tasks = [t for t in tasks if t.status == status]

        # Sort by created_at descending
        tasks.sort(key=lambda t: t.created_at, reverse=True)

        return tasks[:limit]

    async def cleanup_completed(self, max_age_seconds: int = 3600) -> int:
        """Remove completed tasks older than max_age.

        Args:
            max_age_seconds: Maximum age in seconds

        Returns:
            Number of tasks removed
        """
        now = datetime.utcnow()
        removed = 0

        to_remove = []
        for task_id, result in self._tasks.items():
            if result.status in (TaskStatus.COMPLETED, TaskStatus.FAILED):
                if result.completed_at:
                    age = (now - result.completed_at).total_seconds()
                    if age > max_age_seconds:
                        to_remove.append(task_id)

        for task_id in to_remove:
            del self._tasks[task_id]
            removed += 1

        if removed > 0:
            logger.info(f"Cleaned up {removed} completed tasks")

        return removed

    @property
    def pending_count(self) -> int:
        """Count of pending tasks."""
        return sum(1 for t in self._tasks.values() if t.status == TaskStatus.PENDING)

    @property
    def running_count(self) -> int:
        """Count of running tasks."""
        return sum(1 for t in self._tasks.values() if t.status == TaskStatus.RUNNING)


def get_task_queue() -> TaskQueue:
    """Get the singleton task queue instance."""
    return TaskQueue()
