# ADR 001: Schema-per-Tenant Multi-Tenancy

## Status

**Accepted** - 2025-11-20

## Context

The ADK Platform needs to support multiple organizations (tenants) on a shared infrastructure while maintaining strong data isolation. This is particularly important because:

1. Healthcare organizations require strict data segregation for compliance (HIPAA)
2. Tenants should not be able to access each other's data even through application bugs
3. Individual tenant data should be easy to backup, restore, and potentially migrate
4. The platform may eventually need to move high-value tenants to dedicated infrastructure

We evaluated three approaches:
- **Row-level tenant ID**: Add `tenant_id` column to all tables
- **Schema-per-tenant**: Separate PostgreSQL schema per tenant
- **Database-per-tenant**: Separate database per tenant

## Decision

We chose **schema-per-tenant** isolation using PostgreSQL schemas.

### Implementation

```
adk_platform_shared/          # Shared schema
├── tenants                   # Tenant metadata only

adk_tenant_<slug>/            # Per-tenant schema
├── users
├── workshops
├── exercises
├── progress
└── agents
```

Tenant context is managed via:
1. `X-Tenant-ID` HTTP header on all requests
2. `TenantContext` class using Python's `contextvars`
3. Dynamic schema switching via `SET search_path TO` on each session

## Consequences

### Positive

- **Strong isolation**: No cross-tenant data leakage through application bugs
- **Compliance friendly**: Clean audit boundary per tenant
- **Flexible operations**: Can backup/restore individual tenants
- **Migration path**: Can move tenant to dedicated database if needed
- **Query simplicity**: No `WHERE tenant_id = ?` on every query

### Negative

- **Schema management complexity**: Must create schema for each new tenant
- **Cross-tenant queries difficult**: Cannot easily aggregate across tenants
- **Connection overhead**: Schema switch per request (mitigated by search_path)
- **Migration complexity**: Schema changes must be applied to all tenant schemas

### Risks

- **Tenant provisioning latency**: Creating schema takes 5-10 seconds
  - Mitigation: Async provisioning with status indicator
- **Schema drift**: Tenant schemas could diverge over time
  - Mitigation: Centralized migration management via Alembic
- **Connection pool exhaustion**: Many tenants × many schemas
  - Mitigation: Use PgBouncer in transaction mode

## Alternatives Considered

### Row-Level Tenant ID

```sql
-- Every table has tenant_id
CREATE TABLE users (
  id UUID,
  tenant_id UUID NOT NULL,
  email VARCHAR(255),
  -- ...
);
CREATE INDEX idx_users_tenant ON users(tenant_id);
```

**Pros:**
- Simpler implementation
- Easy cross-tenant analytics
- Single schema to manage

**Cons:**
- Every query must filter by tenant_id (easy to forget)
- Application bug can leak data across tenants
- PostgreSQL Row-Level Security adds complexity and performance overhead

### Database-per-Tenant

**Pros:**
- Maximum isolation
- Can use different PostgreSQL versions per tenant
- Natural resource quotas

**Cons:**
- Significant operational overhead (N databases to manage)
- Higher cost (Cloud SQL per database)
- Connection management complexity
- Overkill for our scale

## References

- [Multi-tenant SaaS patterns](https://docs.microsoft.com/en-us/azure/sql-database/saas-tenancy-app-design-patterns)
- [PostgreSQL Schema Isolation](https://www.postgresql.org/docs/current/ddl-schemas.html)
- Original implementation: `src/db/tenant_schema.py`
