"""Tests for task queue."""

import asyncio

import pytest

from src.workers.queue import TaskQueue, TaskResult, TaskStatus


class TestTaskResult:
    """Tests for TaskResult dataclass."""

    def test_create_result(self):
        """Test creating a task result."""
        result = TaskResult(
            task_id="test-123",
            status=TaskStatus.PENDING,
        )

        assert result.task_id == "test-123"
        assert result.status == TaskStatus.PENDING
        assert result.result is None
        assert result.error is None

    def test_to_dict(self):
        """Test serialization to dict."""
        result = TaskResult(
            task_id="test-123",
            status=TaskStatus.COMPLETED,
            result={"data": "value"},
        )

        data = result.to_dict()

        assert data["task_id"] == "test-123"
        assert data["status"] == "completed"
        assert data["result"] == {"data": "value"}

    def test_execution_time(self):
        """Test execution time calculation."""
        from datetime import datetime, timedelta

        start = datetime.utcnow()
        end = start + timedelta(seconds=2)

        result = TaskResult(
            task_id="test",
            status=TaskStatus.COMPLETED,
            started_at=start,
            completed_at=end,
        )

        assert result.execution_time_ms == 2000


class TestTaskQueue:
    """Tests for TaskQueue class."""

    @pytest.fixture
    def fresh_queue(self):
        """Create a fresh queue for each test."""
        # Reset singleton
        TaskQueue._instance = None
        queue = TaskQueue()

        # Clear any existing handlers
        queue._handlers.clear()
        queue._tasks.clear()

        yield queue

        # Cleanup
        TaskQueue._instance = None

    def test_singleton(self, fresh_queue):
        """Test singleton pattern."""
        queue1 = TaskQueue()
        queue2 = TaskQueue()

        assert queue1 is queue2

    def test_register_handler(self, fresh_queue):
        """Test registering a handler."""
        @fresh_queue.register("test_task")
        async def handler(x: int) -> int:
            return x * 2

        assert "test_task" in fresh_queue._handlers

    @pytest.mark.asyncio
    async def test_enqueue_unknown_type(self, fresh_queue):
        """Test enqueueing unknown task type."""
        with pytest.raises(ValueError, match="Unknown task type"):
            await fresh_queue.enqueue("unknown_task")

    @pytest.mark.asyncio
    async def test_enqueue_and_execute(self, fresh_queue):
        """Test enqueueing and executing a task."""
        @fresh_queue.register("double")
        async def double(x: int) -> int:
            return x * 2

        task_id = await fresh_queue.enqueue("double", x=5)

        # Wait for completion
        result = await fresh_queue.wait_for_task(task_id, timeout=5.0)

        assert result is not None
        assert result.status == TaskStatus.COMPLETED
        assert result.result == 10

    @pytest.mark.asyncio
    async def test_task_failure(self, fresh_queue):
        """Test task failure handling."""
        @fresh_queue.register("failing")
        async def failing():
            raise ValueError("Test error")

        task_id = await fresh_queue.enqueue("failing")

        result = await fresh_queue.wait_for_task(task_id, timeout=5.0)

        assert result.status == TaskStatus.FAILED
        assert "Test error" in result.error

    @pytest.mark.asyncio
    async def test_task_delay(self, fresh_queue):
        """Test delayed task execution."""
        @fresh_queue.register("delayed")
        async def delayed() -> str:
            return "done"

        start_time = asyncio.get_event_loop().time()
        task_id = await fresh_queue.enqueue("delayed", delay_seconds=1)

        result = await fresh_queue.wait_for_task(task_id, timeout=5.0)
        elapsed = asyncio.get_event_loop().time() - start_time

        assert result.status == TaskStatus.COMPLETED
        assert elapsed >= 1.0

    @pytest.mark.asyncio
    async def test_get_task_status(self, fresh_queue):
        """Test getting task status."""
        @fresh_queue.register("simple")
        async def simple() -> str:
            return "ok"

        task_id = await fresh_queue.enqueue("simple")

        # Wait for completion
        await fresh_queue.wait_for_task(task_id)

        result = await fresh_queue.get_task_status(task_id)

        assert result is not None
        assert result.task_id == task_id

    @pytest.mark.asyncio
    async def test_get_nonexistent_task(self, fresh_queue):
        """Test getting status of nonexistent task."""
        result = await fresh_queue.get_task_status("nonexistent")

        assert result is None

    @pytest.mark.asyncio
    async def test_list_tasks(self, fresh_queue):
        """Test listing tasks."""
        @fresh_queue.register("list_test")
        async def list_test() -> str:
            return "done"

        # Enqueue multiple tasks
        for _ in range(5):
            await fresh_queue.enqueue("list_test")

        # Wait for all to complete
        await asyncio.sleep(0.5)

        all_tasks = fresh_queue.list_tasks()
        assert len(all_tasks) == 5

        completed_tasks = fresh_queue.list_tasks(status=TaskStatus.COMPLETED)
        assert len(completed_tasks) == 5

    @pytest.mark.asyncio
    async def test_cleanup_completed(self, fresh_queue):
        """Test cleaning up completed tasks."""
        @fresh_queue.register("cleanup_test")
        async def cleanup_test() -> str:
            return "done"

        # Enqueue and complete a task
        task_id = await fresh_queue.enqueue("cleanup_test")
        await fresh_queue.wait_for_task(task_id)

        # Should not clean up (too recent)
        removed = await fresh_queue.cleanup_completed(max_age_seconds=3600)
        assert removed == 0
        assert task_id in fresh_queue._tasks

        # Clean up with 0 age
        removed = await fresh_queue.cleanup_completed(max_age_seconds=0)
        assert removed == 1
        assert task_id not in fresh_queue._tasks

    def test_pending_count(self, fresh_queue):
        """Test pending task count."""
        # Create pending entries directly
        fresh_queue._tasks["t1"] = TaskResult("t1", TaskStatus.PENDING)
        fresh_queue._tasks["t2"] = TaskResult("t2", TaskStatus.RUNNING)
        fresh_queue._tasks["t3"] = TaskResult("t3", TaskStatus.PENDING)

        assert fresh_queue.pending_count == 2
        assert fresh_queue.running_count == 1


class TestTaskStatus:
    """Tests for TaskStatus enum."""

    def test_status_values(self):
        """Test status enum values."""
        assert TaskStatus.PENDING.value == "pending"
        assert TaskStatus.RUNNING.value == "running"
        assert TaskStatus.COMPLETED.value == "completed"
        assert TaskStatus.FAILED.value == "failed"
        assert TaskStatus.CANCELLED.value == "cancelled"

    def test_status_is_string(self):
        """Test status is string enum."""
        assert isinstance(TaskStatus.PENDING, str)
        assert TaskStatus.PENDING == "pending"
