# Technical Analysis: ADK Platform GCP Deployment

**Document Type:** Technical Analysis Overview
**Created:** 2025-11-26
**Last Updated:** 2025-11-26
**Environment:** Development (dev)
**GCP Project:** `adk-workshop-1763490866`

---

## Executive Summary

The ADK Platform development environment has been successfully deployed to Google Cloud Platform. The deployment includes a fully operational FastAPI backend running on Cloud Run, connected to a Cloud SQL PostgreSQL 15 database, with secrets managed via Secret Manager and static assets stored in Cloud Storage.

**Live API URL:** https://adk-platform-dev-api-434169199874.us-central1.run.app

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GCP Project                                    │
│                        adk-workshop-1763490866                              │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         Cloud Run Service                             │  │
│  │                      adk-platform-dev-api                             │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Container: api:dev-latest                                      │  │  │
│  │  │  - FastAPI Application                                          │  │  │
│  │  │  - Port: 8080                                                   │  │  │
│  │  │  - Auto-scaling: 0-5 instances                                  │  │  │
│  │  │  - Memory: 512Mi, CPU: 1                                        │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                │                                      │  │
│  │                    Cloud SQL Proxy Sidecar                           │  │
│  │                                │                                      │  │
│  └────────────────────────────────┼──────────────────────────────────────┘  │
│                                   │                                         │
│  ┌────────────────────────────────┼──────────────────────────────────────┐  │
│  │                                ▼                                      │  │
│  │                    Cloud SQL (PostgreSQL 15)                          │  │
│  │                  adk-platform-dev-db-d086c20e                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Database: adk_platform                                         │  │  │
│  │  │  User: adk_user                                                 │  │  │
│  │  │  Tier: db-f1-micro                                              │  │  │
│  │  │  IP: 34.56.232.66                                               │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       Secret Manager                                  │  │
│  │  - adk-platform-dev-jwt-secret-key                                   │  │
│  │  - adk-platform-dev-google-api-key                                   │  │
│  │  - adk-platform-dev-db-password                                      │  │
│  │  - adk-platform-dev-database-url                                     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       Cloud Storage (GCS)                             │  │
│  │  - adk-platform-dev-static-12ef4ccf     (static assets)              │  │
│  │  - adk-platform-dev-uploads-12ef4ccf    (user uploads)               │  │
│  │  - adk-platform-dev-logs-12ef4ccf       (application logs)           │  │
│  │  - adk-platform-dev-backups-12ef4ccf    (database backups)           │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      Artifact Registry                                │  │
│  │       us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform│  │
│  │  - api:dev-latest (linux/amd64)                                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Resource Inventory

### Compute Resources

| Resource | Name | Configuration | Status |
|----------|------|---------------|--------|
| Cloud Run | `adk-platform-dev-api` | 0-5 instances, 512Mi RAM, 1 CPU | Active |
| Service Account | `adk-platform-dev-run-sa` | Cloud Run runtime identity | Active |

### Database Resources

| Resource | Name | Configuration | Status |
|----------|------|---------------|--------|
| Cloud SQL Instance | `adk-platform-dev-db-d086c20e` | PostgreSQL 15, db-f1-micro | RUNNABLE |
| Database | `adk_platform` | Multi-tenant schema architecture | Active |
| Database User | `adk_user` | Application user | Active |

### Storage Resources

| Bucket | Purpose | Location | Class |
|--------|---------|----------|-------|
| `adk-platform-dev-static-12ef4ccf` | Static assets (CSS, JS, images) | us-central1 | STANDARD |
| `adk-platform-dev-uploads-12ef4ccf` | User file uploads | us-central1 | STANDARD |
| `adk-platform-dev-logs-12ef4ccf` | Application log archives | us-central1 | STANDARD |
| `adk-platform-dev-backups-12ef4ccf` | Database backups | us-central1 | STANDARD |

### Secrets

| Secret | Purpose | Versions |
|--------|---------|----------|
| `adk-platform-dev-jwt-secret-key` | JWT token signing | 1 |
| `adk-platform-dev-google-api-key` | Google AI/ADK API access | 2 |
| `adk-platform-dev-db-password` | Database authentication | 1 |
| `adk-platform-dev-database-url` | Full connection string | 1 |

---

## API Endpoints

### Health & Status

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | API root with version info | No |
| `/health/` | GET | Basic health check | No |
| `/health/ready` | GET | Readiness probe (includes DB check) | No |
| `/docs` | GET | Swagger UI documentation | No |
| `/redoc` | GET | ReDoc documentation | No |

### Tenant Management

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/v1/tenants/` | POST | Create new tenant | No (initial setup) |
| `/api/v1/tenants/{id}` | GET | Get tenant details | Admin |
| `/api/v1/tenants/{id}` | PATCH | Update tenant | Admin |
| `/api/v1/tenants/` | GET | List all tenants | Admin |

### User Management

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/v1/users/register` | POST | Register new user | No |
| `/api/v1/users/login` | POST | Authenticate user | No |
| `/api/v1/users/me` | GET | Get current user | Yes |
| `/api/v1/users/{id}` | GET | Get user by ID | Yes |
| `/api/v1/users/{id}` | PATCH | Update user | Admin |
| `/api/v1/users/` | GET | List users | Yes |

### Workshop Management

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/v1/workshops/` | POST | Create workshop | Instructor+ |
| `/api/v1/workshops/{id}` | GET | Get workshop | Yes |
| `/api/v1/workshops/{id}` | PATCH | Update workshop | Instructor+ |
| `/api/v1/workshops/{id}` | DELETE | Delete workshop | Instructor+ |
| `/api/v1/workshops/` | GET | List workshops | Yes |

---

## Security Configuration

### IAM Roles Assigned to Cloud Run Service Account

| Role | Purpose |
|------|---------|
| `roles/secretmanager.secretAccessor` | Read secrets from Secret Manager |
| `roles/cloudsql.client` | Connect to Cloud SQL via proxy |
| `roles/logging.logWriter` | Write application logs to Cloud Logging |
| `roles/monitoring.metricWriter` | Write metrics to Cloud Monitoring |
| `roles/cloudtrace.agent` | Submit distributed traces |

### Authentication Flow

1. User authenticates via `/api/v1/users/login`
2. Server validates credentials against hashed password (bcrypt)
3. Server generates JWT token (HS256, configurable expiry)
4. Client includes token in `Authorization: Bearer <token>` header
5. Server validates token and extracts user identity

### Multi-Tenant Security

- **X-Tenant-ID Header:** Required for all tenant-scoped operations
- **Schema Isolation:** Each tenant gets dedicated database schema
- **Role-Based Access Control:** 4 roles (participant, instructor, tenant_admin, super_admin)

---

## Database Schema

### Shared Schema (`adk_platform_shared`)

```sql
-- Tenant metadata (shared across all tenants)
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Migration tracking
CREATE TABLE alembic_version (
    version_num VARCHAR(32) PRIMARY KEY
);
```

### Tenant Schema (`adk_platform_tenant_<slug>`)

```sql
-- Per-tenant user accounts
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'participant',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Workshops
CREATE TABLE workshops (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    difficulty VARCHAR(20),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Exercises within workshops
CREATE TABLE exercises (
    id UUID PRIMARY KEY,
    workshop_id UUID REFERENCES workshops(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    order_index INTEGER,
    exercise_type VARCHAR(50)
);

-- User progress tracking
CREATE TABLE progress (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    exercise_id UUID REFERENCES exercises(id),
    status VARCHAR(20),
    completed_at TIMESTAMP,
    score INTEGER
);

-- AI agent configurations
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB,
    is_active BOOLEAN DEFAULT TRUE
);
```

---

## Cost Analysis (Estimated Monthly - Dev Environment)

| Service | Configuration | Estimated Cost |
|---------|---------------|----------------|
| Cloud Run | 0-5 instances, minimal traffic | $0-10/month |
| Cloud SQL | db-f1-micro, 10GB storage | ~$9/month |
| Cloud Storage | 4 buckets, minimal data | ~$1/month |
| Secret Manager | 4 secrets, low access | ~$0.06/month |
| Artifact Registry | 1 image, ~200MB | ~$0.10/month |
| **Total Dev** | | **~$10-20/month** |

**Production Estimate:**
- db-custom-4-16384 with HA: ~$200-300/month
- Cloud Run at scale (10-100 instances): ~$50-200/month
- Storage with more data: ~$20/month
- **Total Production: ~$300-600/month**

---

## Deployment Commands Reference

### Build and Push Image

```bash
# Authenticate with Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build for Cloud Run (linux/amd64)
docker buildx build \
  --platform linux/amd64 \
  -t us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform/api:dev-latest \
  .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform/api:dev-latest
```

### Deploy to Cloud Run

```bash
gcloud run services update adk-platform-dev-api \
  --image=us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform/api:dev-latest \
  --region=us-central1 \
  --project=adk-workshop-1763490866
```

### Run Database Migrations

```bash
# Start Cloud SQL Proxy (with gcloud auth)
cloud-sql-proxy adk-workshop-1763490866:us-central1:adk-platform-dev-db-d086c20e \
  --port=5434 \
  --gcloud-auth &

# Get database password
DB_PASSWORD=$(gcloud secrets versions access latest \
  --secret=adk-platform-dev-db-password \
  --project=adk-workshop-1763490866)

# Run migrations
DATABASE_URL="postgresql+asyncpg://adk_user:${DB_PASSWORD}@127.0.0.1:5434/adk_platform" \
  poetry run alembic upgrade head
```

### View Logs

```bash
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=adk-platform-dev-api" \
  --project=adk-workshop-1763490866 \
  --limit=50 \
  --format="table(timestamp,textPayload)"
```

---

## Monitoring & Observability

### Health Checks

- **Startup Probe:** `GET /health/` (5s initial delay, 10s period, 3 failures)
- **Liveness Probe:** `GET /health/` (30s period, 5s timeout, 3 failures)
- **Readiness Check:** `GET /health/ready` (includes database connectivity test)

### Logging

- Cloud Run automatically sends stdout/stderr to Cloud Logging
- Structured JSON logs recommended for production
- Log retention: 30 days (default)

### Metrics

Cloud Run automatically provides:
- Request count, latency, error rates
- Instance count, CPU/memory utilization
- Cold start frequency
- Billable instance time

---

## Known Issues & Considerations

### Current Limitations

1. **Dev Environment Only:** Staging and production environments not yet deployed
2. **No Custom Domain:** Currently using Cloud Run default URL
3. **No CI/CD Pipeline:** Manual deployment process
4. **No VPC Connector:** Dev environment uses public Cloud SQL IP
5. **Single Region:** Deployed only to us-central1

### Security Considerations

1. **Public API Access:** Cloud Run service allows unauthenticated access to public endpoints
2. **Database Password in Secret Manager:** Ensure proper access controls
3. **JWT Secret Rotation:** Implement secret rotation strategy for production
4. **API Rate Limiting:** Not yet implemented

### Recommended Next Steps

1. Deploy staging environment with VPC connector for private networking
2. Set up CI/CD pipeline (GitHub Actions) for automated deployments
3. Configure custom domain with managed SSL certificate
4. Implement API rate limiting and abuse prevention
5. Set up Cloud Monitoring dashboards and alerts
6. Configure automated database backups to GCS

---

## Terraform State

Infrastructure is managed by Terraform with state stored locally:

```
infrastructure/terraform/
├── main.tf                 # Main orchestration
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── versions.tf             # Provider versions
├── terraform.tfstate       # Current state
└── modules/
    ├── networking/         # VPC, subnets (not used in dev)
    ├── cloud_sql/          # PostgreSQL instance
    ├── cloud_run/          # API service
    ├── secret_manager/     # Secrets
    ├── storage/            # GCS buckets
    └── iam/                # Service accounts
```

**Note:** Consider migrating to remote state (GCS backend) before multi-environment deployment.

---

## Contact & Support

- **Project Repository:** `/Users/ronwince/Desktop/adk-workshop-training`
- **API Documentation:** https://adk-platform-dev-api-434169199874.us-central1.run.app/docs
- **GCP Console:** https://console.cloud.google.com/run?project=adk-workshop-1763490866
