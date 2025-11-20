"""Custom application exceptions"""


class ADKPlatformException(Exception):
    """Base exception for all application exceptions"""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class TenantNotFoundError(ADKPlatformException):
    """Raised when tenant is not found"""

    def __init__(self, tenant_id: str):
        super().__init__(f"Tenant not found: {tenant_id}", status_code=404)


class TenantNotSetError(ADKPlatformException):
    """Raised when tenant context is not set"""

    def __init__(self, message: str = "Tenant context not initialized"):
        super().__init__(message, status_code=500)


class AuthenticationError(ADKPlatformException):
    """Raised when authentication fails"""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401)


class AuthorizationError(ADKPlatformException):
    """Raised when authorization fails"""

    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, status_code=403)


class ResourceNotFoundError(ADKPlatformException):
    """Raised when a resource is not found"""

    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(f"{resource_type} not found: {resource_id}", status_code=404)


class NotFoundError(ADKPlatformException):
    """Raised when a resource is not found (generic)"""

    def __init__(self, message: str):
        super().__init__(message, status_code=404)


class ValidationError(ADKPlatformException):
    """Raised when validation fails"""

    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class DatabaseError(ADKPlatformException):
    """Raised when database operation fails"""

    def __init__(self, message: str):
        super().__init__(f"Database error: {message}", status_code=500)
