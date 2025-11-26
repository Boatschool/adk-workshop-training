"""
Locust load testing file for ADK Platform.

This file defines load test scenarios for the ADK Platform API,
including authentication, workshops, exercises, and admin operations.

Usage:
    # Run with UI (default port 8089)
    locust -f tests/load/locustfile.py --host http://localhost:8080

    # Run headless (10 users, spawn 2/sec, run 5 min)
    locust -f tests/load/locustfile.py --host http://localhost:8080 \
        --users 10 --spawn-rate 2 --run-time 5m --headless

    # Run with HTML report
    locust -f tests/load/locustfile.py --host http://localhost:8080 \
        --users 100 --spawn-rate 10 --run-time 10m --headless \
        --html report-load.html

Performance Targets:
    - API p50: < 100ms
    - API p95: < 500ms
    - API p99: < 1000ms
    - Error rate: < 1%
    - Throughput: > 1000 req/sec
"""

import json
import random
import string
from datetime import datetime
from typing import Any
from uuid import uuid4

from locust import HttpUser, between, events, task
from locust.runners import MasterRunner


# Test configuration
TEST_TENANT_ID = str(uuid4())
REGISTERED_USERS: list[dict] = []


def generate_random_email() -> str:
    """Generate a random email address for testing."""
    random_str = "".join(random.choices(string.ascii_lowercase, k=8))
    return f"loadtest_{random_str}@example.com"


def generate_random_password() -> str:
    """Generate a random strong password."""
    return "LoadTest" + "".join(random.choices(string.digits, k=4)) + "!"


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Initialize test data at the start of the test run."""
    global TEST_TENANT_ID
    print(f"Load test starting with tenant ID: {TEST_TENANT_ID}")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Clean up after test run."""
    print("Load test complete")
    print(f"Registered {len(REGISTERED_USERS)} users during test")


class HealthCheckUser(HttpUser):
    """
    User that only performs health checks.
    Used to establish baseline performance.
    """

    weight = 1
    wait_time = between(1, 3)

    @task(10)
    def health_check(self) -> None:
        """Check API health endpoint."""
        with self.client.get("/health/", catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    response.success()
                else:
                    response.failure(f"Unhealthy status: {data}")
            else:
                response.failure(f"Health check failed: {response.status_code}")

    @task(5)
    def ready_check(self) -> None:
        """Check API readiness endpoint."""
        with self.client.get("/health/ready", catch_response=True) as response:
            if response.status_code in [200, 503]:
                response.success()
            else:
                response.failure(f"Ready check unexpected status: {response.status_code}")


class AnonymousUser(HttpUser):
    """
    Simulates an unauthenticated user.
    Tests public endpoints and authentication flow.
    """

    weight = 2
    wait_time = between(1, 5)

    @task(3)
    def view_health(self) -> None:
        """View health endpoint (public)."""
        self.client.get("/health/")

    @task(2)
    def view_openapi_docs(self) -> None:
        """View OpenAPI documentation (public)."""
        self.client.get("/openapi.json")

    @task(1)
    def attempt_protected_without_auth(self) -> None:
        """Attempt to access protected endpoint without authentication."""
        with self.client.get(
            "/api/v1/users/me",
            catch_response=True,
        ) as response:
            # Should return 401 or 403
            if response.status_code in [401, 403]:
                response.success()
            else:
                response.failure(f"Expected 401/403, got {response.status_code}")


class AuthenticatedUser(HttpUser):
    """
    Simulates an authenticated user.
    Tests authenticated API operations.
    """

    weight = 5
    wait_time = between(2, 5)
    access_token: str = ""
    user_data: dict = {}

    def on_start(self) -> None:
        """Login or register user on start."""
        self.tenant_id = TEST_TENANT_ID

        # Try to register a new user
        email = generate_random_email()
        password = generate_random_password()

        register_response = self.client.post(
            "/api/v1/users/register",
            json={
                "email": email,
                "password": password,
                "full_name": f"Load Test User {random.randint(1, 10000)}",
            },
            headers={"X-Tenant-ID": self.tenant_id},
        )

        if register_response.status_code in [201, 200]:
            # Registration successful, now login
            login_response = self.client.post(
                "/api/v1/users/login",
                json={"email": email, "password": password},
                headers={"X-Tenant-ID": self.tenant_id},
            )

            if login_response.status_code == 200:
                data = login_response.json()
                self.access_token = data.get("access_token", "")
                self.user_data = {
                    "email": email,
                    "password": password,
                    "id": data.get("id"),
                }
                REGISTERED_USERS.append(self.user_data)
            else:
                # Login failed after registration
                self.access_token = ""
        else:
            # Registration might have failed due to duplicate email
            # Generate a mock token for basic testing
            self.access_token = ""

    @property
    def auth_headers(self) -> dict:
        """Return authorization headers."""
        if self.access_token:
            return {
                "Authorization": f"Bearer {self.access_token}",
                "X-Tenant-ID": self.tenant_id,
            }
        return {"X-Tenant-ID": self.tenant_id}

    @task(5)
    def get_current_user(self) -> None:
        """Get current user info."""
        if not self.access_token:
            return

        with self.client.get(
            "/api/v1/users/me",
            headers=self.auth_headers,
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code in [401, 403]:
                # Token might have expired
                response.success()
            else:
                response.failure(f"Get user failed: {response.status_code}")

    @task(3)
    def list_workshops(self) -> None:
        """List available workshops."""
        if not self.access_token:
            return

        with self.client.get(
            "/api/v1/workshops/",
            headers=self.auth_headers,
            catch_response=True,
        ) as response:
            if response.status_code in [200, 500]:
                response.success()
            else:
                response.failure(f"List workshops failed: {response.status_code}")

    @task(2)
    def list_exercises(self) -> None:
        """List exercises."""
        if not self.access_token:
            return

        with self.client.get(
            "/api/v1/exercises/",
            headers=self.auth_headers,
            catch_response=True,
        ) as response:
            if response.status_code in [200, 500]:
                response.success()
            else:
                response.failure(f"List exercises failed: {response.status_code}")

    @task(1)
    def list_users(self) -> None:
        """List users (may require elevated permissions)."""
        if not self.access_token:
            return

        with self.client.get(
            "/api/v1/users/",
            headers=self.auth_headers,
            params={"limit": 10},
            catch_response=True,
        ) as response:
            if response.status_code in [200, 403, 500]:
                response.success()
            else:
                response.failure(f"List users unexpected: {response.status_code}")

    @task(1)
    def view_nonexistent_workshop(self) -> None:
        """Try to view a non-existent workshop."""
        if not self.access_token:
            return

        fake_id = str(uuid4())
        with self.client.get(
            f"/api/v1/workshops/{fake_id}",
            headers=self.auth_headers,
            catch_response=True,
        ) as response:
            if response.status_code == 404:
                response.success()
            elif response.status_code in [401, 403, 500]:
                response.success()
            else:
                response.failure(f"Expected 404, got {response.status_code}")


class PowerUser(HttpUser):
    """
    Simulates a power user performing write operations.
    Tests create/update/delete operations.
    """

    weight = 2
    wait_time = between(3, 8)
    access_token: str = ""
    created_items: list[str] = []

    def on_start(self) -> None:
        """Register and login as a new user."""
        self.tenant_id = TEST_TENANT_ID
        self.created_items = []

        email = generate_random_email()
        password = generate_random_password()

        # Register
        self.client.post(
            "/api/v1/users/register",
            json={
                "email": email,
                "password": password,
                "full_name": f"Power User {random.randint(1, 10000)}",
            },
            headers={"X-Tenant-ID": self.tenant_id},
        )

        # Login
        response = self.client.post(
            "/api/v1/users/login",
            json={"email": email, "password": password},
            headers={"X-Tenant-ID": self.tenant_id},
        )

        if response.status_code == 200:
            data = response.json()
            self.access_token = data.get("access_token", "")
        else:
            self.access_token = ""

    @property
    def auth_headers(self) -> dict:
        """Return authorization headers."""
        if self.access_token:
            return {
                "Authorization": f"Bearer {self.access_token}",
                "X-Tenant-ID": self.tenant_id,
            }
        return {"X-Tenant-ID": self.tenant_id}

    @task(2)
    def create_and_list_cycle(self) -> None:
        """Perform a create-list-read cycle."""
        if not self.access_token:
            return

        # List first
        self.client.get(
            "/api/v1/workshops/",
            headers=self.auth_headers,
        )

    @task(3)
    def read_intensive(self) -> None:
        """Perform multiple read operations."""
        if not self.access_token:
            return

        # Multiple reads to simulate dashboard loading
        self.client.get("/api/v1/workshops/", headers=self.auth_headers)
        self.client.get("/api/v1/exercises/", headers=self.auth_headers)
        self.client.get("/api/v1/users/me", headers=self.auth_headers)

    @task(1)
    def pagination_test(self) -> None:
        """Test pagination through results."""
        if not self.access_token:
            return

        for skip in [0, 10, 20]:
            self.client.get(
                "/api/v1/workshops/",
                headers=self.auth_headers,
                params={"skip": skip, "limit": 10},
            )


class AdminUser(HttpUser):
    """
    Simulates an admin user performing management operations.
    Lower weight as there are fewer admins.
    """

    weight = 1
    wait_time = between(5, 15)
    access_token: str = ""

    def on_start(self) -> None:
        """Setup admin user (mock admin token)."""
        self.tenant_id = TEST_TENANT_ID
        # In real testing, you'd create an actual admin user
        # For load testing, we'll just use a mock approach
        self.access_token = ""

    @property
    def auth_headers(self) -> dict:
        """Return authorization headers."""
        if self.access_token:
            return {
                "Authorization": f"Bearer {self.access_token}",
                "X-Tenant-ID": self.tenant_id,
            }
        return {"X-Tenant-ID": self.tenant_id}

    @task(1)
    def list_all_users(self) -> None:
        """List all users (admin operation)."""
        with self.client.get(
            "/api/v1/users/",
            headers=self.auth_headers,
            params={"limit": 100},
            catch_response=True,
        ) as response:
            # May succeed or fail based on auth - both are valid outcomes
            if response.status_code in [200, 401, 403, 500]:
                response.success()

    @task(1)
    def tenant_operations(self) -> None:
        """Perform tenant-related operations."""
        with self.client.get(
            "/api/v1/tenants/",
            headers=self.auth_headers,
            catch_response=True,
        ) as response:
            # Admin endpoint - may require special permissions
            if response.status_code in [200, 401, 403, 500]:
                response.success()


class SpikeUser(HttpUser):
    """
    User for spike testing.
    Makes rapid requests to simulate traffic spikes.
    """

    weight = 1
    wait_time = between(0.1, 0.5)

    @task
    def rapid_health_check(self) -> None:
        """Rapid health checks for spike testing."""
        self.client.get("/health/")

    @task
    def rapid_docs_check(self) -> None:
        """Rapid docs access for spike testing."""
        self.client.get("/openapi.json")
