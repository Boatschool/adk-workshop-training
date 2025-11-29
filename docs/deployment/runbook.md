# ADK Platform Deployment Runbook

This runbook provides step-by-step procedures for deploying and managing the ADK Platform across environments.

## Table of Contents

1. [Environment Overview](#environment-overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Procedures](#deployment-procedures)
4. [Database Migrations](#database-migrations)
5. [Rollback Procedures](#rollback-procedures)
6. [Monitoring & Health Checks](#monitoring--health-checks)
7. [Troubleshooting](#troubleshooting)
8. [Emergency Procedures](#emergency-procedures)

---

## Environment Overview

| Environment | URL | Project | Purpose |
|-------------|-----|---------|---------|
| **Dev** | https://adk-platform-dev-api-434169199874.us-central1.run.app | adk-workshop-1763490866 | Development testing |
| **Staging** | https://adk-platform-staging-api-434169199874.us-central1.run.app | adk-workshop-1763490866 | Pre-production validation |
| **Production** | https://adk-platform-prod-api-434169199874.us-central1.run.app | adk-workshop-1763490866 | Live production |

### Infrastructure Components

- **Compute:** Cloud Run (serverless containers)
- **Database:** Cloud SQL PostgreSQL 15
- **Secrets:** Google Secret Manager
- **Storage:** Cloud Storage (4 buckets per environment)
- **Registry:** Artifact Registry (`us-central1-docker.pkg.dev`)

---

## Prerequisites

### Local Tools Required

```bash
# Google Cloud SDK
gcloud --version

# Docker
docker --version

# Terraform (for infrastructure changes)
terraform --version

# Python & Poetry (for migrations)
python --version
poetry --version
```

### Authentication

```bash
# Authenticate with your Google account
gcloud auth login

# Set application default credentials
gcloud auth application-default login

# Set the project
gcloud config set project adk-workshop-1763490866
```

### Required Permissions

- `roles/run.admin` - Deploy to Cloud Run
- `roles/cloudsql.client` - Connect to Cloud SQL
- `roles/secretmanager.secretAccessor` - Access secrets
- `roles/artifactregistry.writer` - Push images

---

## Deployment Procedures

### Automated Deployment (Recommended)

#### Deploy to Staging

Staging deploys automatically when code is merged to `main`:

1. Create a Pull Request against `main`
2. Ensure all CI checks pass
3. Get code review approval
4. Merge the PR
5. Monitor the GitHub Actions workflow

#### Deploy to Production

Production requires manual approval:

1. Go to GitHub Actions
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Optionally specify an image tag
5. Wait for approval (check your email or GitHub notifications)
6. Approve in the GitHub environment settings
7. Monitor the deployment

### Manual Deployment

#### Step 1: Build and Push Docker Image

```bash
# Set variables
export PROJECT_ID=adk-workshop-1763490866
export REGION=us-central1
export ENV=staging  # or 'dev' or 'production'

# Configure Docker authentication
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build for linux/amd64 (required for Cloud Run)
docker buildx build \
  --platform linux/amd64 \
  -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/adk-platform/api:${ENV}-$(date +%Y%m%d-%H%M%S) \
  -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/adk-platform/api:${ENV}-latest \
  --push \
  .
```

#### Step 2: Run Database Migrations

```bash
# Download Cloud SQL Proxy if not present
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.2/cloud-sql-proxy.darwin.arm64
chmod +x cloud-sql-proxy

# Get the database instance connection name
DB_INSTANCE=$(gcloud sql instances list --filter="name~${ENV}" --format="value(connectionName)")

# Start proxy (use a free port like 5434)
./cloud-sql-proxy ${DB_INSTANCE} --port 5434 &
PROXY_PID=$!

# Get database password from Secret Manager
DB_PASSWORD=$(gcloud secrets versions access latest --secret="adk-platform-${ENV}-db-password")

# Run migrations
DATABASE_URL="postgresql+asyncpg://adk_user:${DB_PASSWORD}@localhost:5434/adk_platform" \
  poetry run alembic upgrade head

# Stop proxy
kill $PROXY_PID
```

#### Step 3: Deploy to Cloud Run

```bash
# Deploy the service
gcloud run deploy adk-platform-${ENV}-api \
  --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/adk-platform/api:${ENV}-latest \
  --region ${REGION} \
  --platform managed \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars "ENVIRONMENT=${ENV}" \
  --set-secrets "SECRET_KEY=adk-platform-${ENV}-jwt-secret-key:latest" \
  --set-secrets "DATABASE_URL=adk-platform-${ENV}-database-url:latest" \
  --set-secrets "GOOGLE_API_KEY=adk-platform-${ENV}-google-api-key:latest"
```

#### Step 4: Verify Deployment

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe adk-platform-${ENV}-api \
  --region ${REGION} \
  --format 'value(status.url)')

# Health check
curl ${SERVICE_URL}/health/

# Readiness check
curl ${SERVICE_URL}/health/ready

# API docs
open ${SERVICE_URL}/docs
```

---

## Database Migrations

### View Migration Status

```bash
# Start Cloud SQL Proxy
./cloud-sql-proxy ${DB_INSTANCE} --port 5434 &

# Check current migration
DATABASE_URL="postgresql+asyncpg://adk_user:${DB_PASSWORD}@localhost:5434/adk_platform" \
  poetry run alembic current

# View migration history
DATABASE_URL="postgresql+asyncpg://adk_user:${DB_PASSWORD}@localhost:5434/adk_platform" \
  poetry run alembic history
```

### Create New Migration

```bash
# Auto-generate migration from model changes
poetry run alembic revision --autogenerate -m "Description of changes"

# Or create empty migration for manual SQL
poetry run alembic revision -m "Description of changes"
```

### Rollback Migration

```bash
# Rollback one step
DATABASE_URL="..." poetry run alembic downgrade -1

# Rollback to specific revision
DATABASE_URL="..." poetry run alembic downgrade <revision_id>
```

---

## Rollback Procedures

### Automatic Rollback (Production)

Production deployments automatically rollback if smoke tests fail. The rollback:

1. Identifies the previous healthy revision
2. Routes 100% traffic to the previous revision
3. Sends notification to the team

### Manual Rollback

#### Option 1: Traffic Migration (Fast, No Downtime)

```bash
# List recent revisions
gcloud run revisions list \
  --service adk-platform-${ENV}-api \
  --region ${REGION}

# Route traffic to previous revision
gcloud run services update-traffic adk-platform-${ENV}-api \
  --region ${REGION} \
  --to-revisions PREVIOUS_REVISION_NAME=100
```

#### Option 2: Redeploy Previous Image

```bash
# List available images
gcloud artifacts docker images list \
  ${REGION}-docker.pkg.dev/${PROJECT_ID}/adk-platform/api

# Deploy specific image tag
gcloud run deploy adk-platform-${ENV}-api \
  --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/adk-platform/api:PREVIOUS_TAG \
  --region ${REGION}
```

#### Option 3: Database Rollback (If Migration Caused Issues)

```bash
# Connect to database
./cloud-sql-proxy ${DB_INSTANCE} --port 5434 &

# Rollback migration
DATABASE_URL="..." poetry run alembic downgrade -1

# Redeploy previous application version
# (follow Option 2 above)
```

---

## Monitoring & Health Checks

### Health Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/health/` | Basic liveness | `{"status": "healthy"}` |
| `/health/ready` | Readiness (DB check) | `{"status": "ready", "database": "connected"}` |

### Cloud Monitoring

```bash
# View Cloud Run metrics
open "https://console.cloud.google.com/run/detail/${REGION}/adk-platform-${ENV}-api/metrics?project=${PROJECT_ID}"

# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=adk-platform-${ENV}-api" --limit 50
```

### Quick Health Check Script

```bash
#!/bin/bash
ENV=${1:-dev}
URL="https://adk-platform-${ENV}-api-434169199874.us-central1.run.app"

echo "Checking $ENV environment..."
echo "Health: $(curl -s -o /dev/null -w '%{http_code}' $URL/health/)"
echo "Ready: $(curl -s -o /dev/null -w '%{http_code}' $URL/health/ready)"
```

---

## Troubleshooting

### Common Issues

#### 1. Container Fails to Start

**Symptoms:** Cloud Run revision fails, logs show startup errors

**Check:**
```bash
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" --limit 20
```

**Common Causes:**
- Missing environment variables or secrets
- Database connection issues
- Import errors in Python code

#### 2. Database Connection Failures

**Symptoms:** `/health/ready` returns 503, logs show connection errors

**Check:**
```bash
# Verify Cloud SQL is running
gcloud sql instances describe adk-platform-${ENV}-db-* --format="value(state)"

# Check secret exists
gcloud secrets versions list adk-platform-${ENV}-database-url
```

**Solutions:**
- Verify DATABASE_URL secret format
- Check Cloud Run service account has `roles/cloudsql.client`
- Ensure Cloud SQL instance is not stopped

#### 3. Permission Denied Errors

**Symptoms:** 403 errors accessing secrets or database

**Check:**
```bash
# Get service account
SA=$(gcloud run services describe adk-platform-${ENV}-api --region ${REGION} --format "value(spec.template.spec.serviceAccountName)")

# Check IAM bindings
gcloud projects get-iam-policy ${PROJECT_ID} --flatten="bindings[].members" --filter="bindings.members:${SA}"
```

#### 4. Slow Response Times

**Symptoms:** p95 latency > 500ms

**Check:**
- Cloud SQL CPU/memory utilization
- Cloud Run instance count (may need to increase min instances)
- Database query performance

---

## Emergency Procedures

### Complete Service Outage

1. **Assess:** Check Cloud Run, Cloud SQL, and networking
2. **Communicate:** Notify stakeholders
3. **Mitigate:**
   - If Cloud Run issue: rollback to previous revision
   - If Cloud SQL issue: wait or failover to replica
4. **Resolve:** Fix root cause
5. **Post-mortem:** Document and prevent recurrence

### Security Incident

1. **Contain:** Disable compromised credentials/services
2. **Assess:** Review logs for unauthorized access
3. **Remediate:** Rotate secrets, patch vulnerabilities
4. **Report:** Follow incident response procedures

### Data Loss

1. **Stop:** Halt any operations that might cause further loss
2. **Assess:** Determine scope and cause
3. **Recover:**
   - Point-in-time recovery from Cloud SQL backups
   - Restore from GCS backup bucket
4. **Verify:** Confirm data integrity

### Contact Information

- **On-call:** [Configure your on-call rotation]
- **GCP Support:** https://console.cloud.google.com/support
- **Escalation:** [Your escalation path]

---

## Appendix

### Environment Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `ENVIRONMENT` | Environment name | Set in Cloud Run |
| `SECRET_KEY` | JWT signing key | Secret Manager |
| `DATABASE_URL` | PostgreSQL connection string | Secret Manager |
| `GOOGLE_API_KEY` | Google AI API key | Secret Manager |

### Useful Commands

```bash
# List all Cloud Run services
gcloud run services list --region ${REGION}

# Get Cloud Run service details
gcloud run services describe adk-platform-${ENV}-api --region ${REGION}

# List Cloud SQL instances
gcloud sql instances list

# Access Secret Manager
gcloud secrets list

# View recent deployments
gcloud run revisions list --service adk-platform-${ENV}-api --region ${REGION} --limit 5
```
