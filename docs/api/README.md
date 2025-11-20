# API Documentation

## Overview

The ADK Platform API is a REST API built with FastAPI that provides multi-tenant access to agent development and training resources.

**Base URL**: `http://localhost:8080` (development)

**API Version**: v1

**OpenAPI Documentation**: `http://localhost:8080/docs`

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### Multi-Tenant Headers

All authenticated requests (except tenant creation) require the `X-Tenant-ID` header:

```
X-Tenant-ID: <tenant_uuid>
```

## Quick Start

### 1. Start the API Server

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Start API server
poetry run uvicorn src.api.main:app --host 0.0.0.0 --port 8080 --reload
```

### 2. Create a Tenant

```bash
curl -X POST http://localhost:8080/api/v1/tenants/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "slug": "acme",
    "subscription_tier": "trial"
  }'
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Acme Corporation",
  "slug": "acme",
  "database_schema": "adk_platform_tenant_acme",
  "status": "active",
  "subscription_tier": "trial",
  "settings": {},
  "created_at": "2025-11-20T12:00:00Z",
  "updated_at": "2025-11-20T12:00:00Z"
}
```

### 3. Register a User

```bash
curl -X POST http://localhost:8080/api/v1/users/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 123e4567-e89b-12d3-a456-426614174000" \
  -d '{
    "email": "admin@acme.com",
    "password": "secure_password_123",
    "full_name": "John Doe",
    "role": "tenant_admin"
  }'
```

### 4. Login

```bash
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 123e4567-e89b-12d3-a456-426614174000" \
  -d '{
    "email": "admin@acme.com",
    "password": "secure_password_123"
  }'
```

Response:
```json
{
  "id": "user-uuid",
  "email": "admin@acme.com",
  "full_name": "John Doe",
  "role": "tenant_admin",
  "is_active": true,
  "created_at": "2025-11-20T12:00:00Z",
  "updated_at": "2025-11-20T12:00:00Z",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 5. Create a Workshop

```bash
curl -X POST http://localhost:8080/api/v1/workshops/ \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Introduction to ADK",
    "description": "Learn the basics of Google Agent Development Kit",
    "start_date": "2025-12-01T09:00:00Z",
    "end_date": "2025-12-01T17:00:00Z"
  }'
```

## API Endpoints

### Health

#### GET /health/

Basic health check endpoint (no authentication required).

**Response**:
```json
{
  "status": "healthy",
  "service": "adk-platform-api",
  "version": "1.0.0"
}
```

#### GET /health/ready

Readiness probe that checks database connectivity (no authentication required).

**Response**:
```json
{
  "status": "ready",
  "database": "connected",
  "service": "adk-platform-api"
}
```

### Tenants

#### POST /api/v1/tenants/

Create a new tenant (no authentication required for initial setup).

**Request Body**:
```json
{
  "name": "string (required, max 255 chars)",
  "slug": "string (required, lowercase alphanumeric with hyphens)",
  "subscription_tier": "string (default: trial)",
  "google_api_key": "string (optional, stored in Secret Manager)"
}
```

#### GET /api/v1/tenants/{tenant_id}

Get tenant by ID (requires admin role).

**Headers**: `Authorization: Bearer <token>`

#### PATCH /api/v1/tenants/{tenant_id}

Update tenant (requires admin role).

**Headers**: `Authorization: Bearer <token>`

**Request Body** (all fields optional):
```json
{
  "name": "string",
  "status": "active | suspended | deleted",
  "subscription_tier": "string",
  "google_api_key": "string",
  "settings": {}
}
```

#### GET /api/v1/tenants/

List all tenants (requires admin role).

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `skip` (int, default: 0) - Pagination offset
- `limit` (int, default: 100, max: 100) - Pagination limit

### Users

#### POST /api/v1/users/register

Register a new user in the tenant.

**Headers**: `X-Tenant-ID: <tenant-uuid>`

**Request Body**:
```json
{
  "email": "user@example.com (required, valid email)",
  "password": "string (required, min 8 chars)",
  "full_name": "string (optional, max 255 chars)",
  "role": "participant | instructor | tenant_admin | super_admin (default: participant)"
}
```

#### POST /api/v1/users/login

Authenticate user and get access token.

**Headers**: `X-Tenant-ID: <tenant-uuid>`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "string",
  "role": "participant",
  "is_active": true,
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "access_token": "jwt_token",
  "token_type": "bearer"
}
```

#### GET /api/v1/users/me

Get current authenticated user information.

**Headers**:
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-uuid>`

#### GET /api/v1/users/{user_id}

Get user by ID (requires authentication).

**Headers**:
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-uuid>`

#### PATCH /api/v1/users/{user_id}

Update user (requires admin role).

**Headers**:
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-uuid>`

**Request Body** (all fields optional):
```json
{
  "full_name": "string",
  "role": "participant | instructor | tenant_admin | super_admin",
  "is_active": true
}
```

#### GET /api/v1/users/

List users (requires authentication).

**Headers**:
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-uuid>`

**Query Parameters**:
- `skip` (int, default: 0)
- `limit` (int, default: 100, max: 100)
- `is_active` (boolean, optional) - Filter by active status

### Workshops

#### POST /api/v1/workshops/

Create a new workshop (requires instructor role or higher).

**Headers**:
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-uuid>`

**Request Body**:
```json
{
  "title": "string (required, max 255 chars)",
  "description": "string (optional)",
  "start_date": "ISO 8601 timestamp (optional)",
  "end_date": "ISO 8601 timestamp (optional)"
}
```

#### GET /api/v1/workshops/{workshop_id}

Get workshop by ID (requires authentication).

**Headers**:
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-uuid>`

#### PATCH /api/v1/workshops/{workshop_id}

Update workshop (requires instructor role or higher).

**Headers**:
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-uuid>`

**Request Body** (all fields optional):
```json
{
  "title": "string",
  "description": "string",
  "status": "draft | published | archived",
  "start_date": "ISO 8601 timestamp",
  "end_date": "ISO 8601 timestamp"
}
```

#### DELETE /api/v1/workshops/{workshop_id}

Delete workshop (requires instructor role or higher).

**Headers**:
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-uuid>`

**Response**: 204 No Content

#### GET /api/v1/workshops/

List workshops (requires authentication).

**Headers**:
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-uuid>`

**Query Parameters**:
- `skip` (int, default: 0)
- `limit` (int, default: 100, max: 100)
- `status` (string, optional) - Filter by workshop status

## Role-Based Access Control

### Roles

1. **participant** - Default role, can view and complete workshops
2. **instructor** - Can create and manage workshops
3. **tenant_admin** - Can manage users and tenant settings within their tenant
4. **super_admin** - Platform administrator with cross-tenant access

### Permission Matrix

| Endpoint | participant | instructor | tenant_admin | super_admin |
|----------|-------------|-----------|--------------|-------------|
| Health endpoints | ✓ | ✓ | ✓ | ✓ |
| Create tenant | ✓ | ✓ | ✓ | ✓ |
| View tenants | ✗ | ✗ | ✗ | ✓ |
| Register user | ✓ | ✓ | ✓ | ✓ |
| Login | ✓ | ✓ | ✓ | ✓ |
| View own profile | ✓ | ✓ | ✓ | ✓ |
| View other users | ✓ | ✓ | ✓ | ✓ |
| Update users | ✗ | ✗ | ✓ | ✓ |
| Create workshops | ✗ | ✓ | ✓ | ✓ |
| View workshops | ✓ | ✓ | ✓ | ✓ |
| Update workshops | ✗ | ✓ | ✓ | ✓ |
| Delete workshops | ✗ | ✓ | ✓ | ✓ |

## Error Responses

All error responses follow this structure:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Status Codes

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request that created a resource
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid request data or validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions for this operation
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error

### Common Error Examples

**Missing Tenant Header**:
```json
{
  "detail": "X-Tenant-ID header is required"
}
```

**Invalid Credentials**:
```json
{
  "detail": "Invalid email or password"
}
```

**Insufficient Permissions**:
```json
{
  "detail": "Requires one of roles: ['tenant_admin', 'super_admin']"
}
```

**Validation Error**:
```json
{
  "detail": "User with email 'user@example.com' already exists"
}
```

## Development Tools

### Interactive API Documentation

Visit `http://localhost:8080/docs` for interactive Swagger UI documentation where you can:
- Browse all available endpoints
- View request/response schemas
- Try out API calls directly from the browser
- See authentication requirements

### ReDoc Documentation

Visit `http://localhost:8080/redoc` for alternative API documentation with a clean, responsive layout.

### OpenAPI Schema

The OpenAPI 3.0 schema is available at `http://localhost:8080/openapi.json`.

## Testing the API

### Using curl

See examples above in the Quick Start section.

### Using httpie

```bash
# Install httpie
pip install httpie

# Health check
http GET http://localhost:8080/health/

# Create tenant
http POST http://localhost:8080/api/v1/tenants/ \
  name="Acme Corp" \
  slug="acme" \
  subscription_tier="trial"

# Register user
http POST http://localhost:8080/api/v1/users/register \
  X-Tenant-ID:123e4567-e89b-12d3-a456-426614174000 \
  email="user@acme.com" \
  password="secure123" \
  role="instructor"
```

### Using Python requests

```python
import requests

BASE_URL = "http://localhost:8080"
TENANT_ID = "123e4567-e89b-12d3-a456-426614174000"

# Health check
response = requests.get(f"{BASE_URL}/health/")
print(response.json())

# Login
response = requests.post(
    f"{BASE_URL}/api/v1/users/login",
    headers={"X-Tenant-ID": TENANT_ID},
    json={"email": "user@acme.com", "password": "secure123"}
)
token = response.json()["access_token"]

# Create workshop
response = requests.post(
    f"{BASE_URL}/api/v1/workshops/",
    headers={
        "X-Tenant-ID": TENANT_ID,
        "Authorization": f"Bearer {token}"
    },
    json={
        "title": "Introduction to ADK",
        "description": "Learn AI agent development"
    }
)
print(response.json())
```

## Production Deployment

See `docs/deployment/gcp-setup.md` for instructions on deploying the API to Google Cloud Platform with Cloud Run.

## Troubleshooting

### Server Won't Start

1. Check PostgreSQL is running: `docker-compose ps`
2. Check environment variables: `cat .env`
3. Check logs for errors

### Database Connection Errors

1. Verify database is accessible: `docker-compose exec postgres psql -U adk_user -d adk_platform -c "SELECT 1"`
2. Check DATABASE_URL in .env
3. Ensure migrations are applied: `poetry run alembic current`

### Authentication Errors

1. Verify token is not expired (tokens expire after 1 hour by default)
2. Check X-Tenant-ID header matches the tenant in the token
3. Ensure user has sufficient role for the operation

## Rate Limiting

Currently no rate limiting is implemented. For production deployment, consider adding rate limiting middleware or using Cloud Armor (GCP) or API Gateway.

## Changelog

### v1.0.0 (2025-11-20)

- Initial API release
- Multi-tenant architecture with schema-per-tenant isolation
- JWT authentication
- Role-based access control
- Tenant, User, and Workshop management endpoints
- Health check and readiness probes
- OpenAPI documentation
