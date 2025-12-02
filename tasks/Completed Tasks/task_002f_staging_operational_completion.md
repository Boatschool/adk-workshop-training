# Task #002f: Staging Environment Operational Completion

## Task Information

- **Task Number**: 002f
- **Parent Task**: 002 (Phase 8)
- **Task Name**: Staging Environment Operational Completion
- **Priority**: HIGH
- **Estimated Effort**: 1-2 hours
- **Assigned To**: TBD
- **Created Date**: 2025-11-26
- **Due Date**: TBD
- **Status**: ✅ COMPLETE
- **Completed Date**: 2025-11-26

## Description

Complete the operational setup for the staging environment. The Terraform infrastructure is deployed and all GCP resources are running. This task covers the remaining steps to make staging fully operational: database migrations, secrets configuration, application deployment, and verification.

**Prerequisites:**
- Staging Terraform infrastructure deployed (COMPLETE)
- Cloud SQL instance running: `adk-platform-staging-db-936214e0`
- Cloud Run service ready: `adk-platform-staging-api`
- All secrets created in Secret Manager

## Acceptance Criteria

- [x] Database migrations applied successfully to staging Cloud SQL
- [x] Google API key set with valid production key (not placeholder)
- [x] Application Docker image deployed to staging Cloud Run
- [x] Health endpoint returns 200 with authentication
- [x] Readiness endpoint returns 200 (confirms DB connectivity)
- [x] API documentation accessible at /docs

## Tasks

### 1. Run Database Migrations (~15 min)

Connect to staging Cloud SQL via Cloud SQL Proxy and apply Alembic migrations.

```bash
# Download Cloud SQL Proxy (if not present)
curl -o cloud_sql_proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.amd64
chmod +x cloud_sql_proxy

# Get connection info
DB_INSTANCE="adk-workshop-1763490866:us-central1:adk-platform-staging-db-936214e0"
DB_PASSWORD=$(gcloud secrets versions access latest --secret=adk-platform-staging-db-password --project=adk-workshop-1763490866)

# Start proxy on port 5434 (avoid conflicts)
./cloud_sql_proxy --port=5434 "$DB_INSTANCE" &
PROXY_PID=$!

# Run migrations
cd /Users/ronwince/Desktop/adk-workshop-training
DATABASE_URL="postgresql+asyncpg://adk_user:${DB_PASSWORD}@localhost:5434/adk_platform" \
  poetry run alembic upgrade head

# Stop proxy
kill $PROXY_PID
```

**Expected Output:**
- All migrations applied (should see migration hashes)
- `adk_platform_shared.alembic_version` table updated
- `adk_platform_shared.tenants` table created

### 2. Set Google API Key (~5 min)

Replace the placeholder Google API key with a valid key for the Google ADK.

```bash
# Check current value (should be placeholder)
gcloud secrets versions access latest \
  --secret=adk-platform-staging-google-api-key \
  --project=adk-workshop-1763490866

# Add new version with real API key
echo -n "YOUR_REAL_GOOGLE_API_KEY" | gcloud secrets versions add \
  adk-platform-staging-google-api-key \
  --data-file=- \
  --project=adk-workshop-1763490866

# Verify new version is latest
gcloud secrets versions list adk-platform-staging-google-api-key \
  --project=adk-workshop-1763490866
```

**Note:** Get the Google API key from Google Cloud Console > APIs & Services > Credentials. Ensure it has access to the Generative AI API.

### 3. Build and Deploy Application Image (~20 min)

Build the Docker image for linux/amd64 and deploy to staging Cloud Run.

```bash
cd /Users/ronwince/Desktop/adk-workshop-training

# Authenticate Docker to Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build for linux/amd64 (required for Cloud Run)
docker buildx build --platform linux/amd64 \
  -t us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform/api:staging-$(git rev-parse --short HEAD) \
  -t us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform/api:staging-latest \
  --push .

# Deploy to Cloud Run
gcloud run deploy adk-platform-staging-api \
  --image=us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform/api:staging-latest \
  --region=us-central1 \
  --project=adk-workshop-1763490866
```

### 4. Verify Deployment (~10 min)

Test all endpoints to confirm staging is fully operational.

```bash
SERVICE_URL="https://adk-platform-staging-api-mjwk2v5aqq-uc.a.run.app"

# Get authentication token
TOKEN=$(gcloud auth print-identity-token)

# Test health endpoint
echo "=== Health Check ==="
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$SERVICE_URL/health/"

# Test readiness (includes DB check)
echo "=== Readiness Check ==="
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$SERVICE_URL/health/ready"

# Test API docs
echo "=== API Documentation ==="
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$SERVICE_URL/docs" | head -20

# Test tenant creation (optional)
echo "=== Create Test Tenant ==="
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Staging Test Org", "slug": "staging-test"}' \
  "$SERVICE_URL/api/v1/tenants/"
```

**Expected Results:**
- Health: `{"status": "healthy"}` with HTTP 200
- Readiness: `{"status": "ready", "database": "connected"}` with HTTP 200
- Docs: HTML content with HTTP 200

## Environment Details

| Resource | Value |
|----------|-------|
| Project ID | `adk-workshop-1763490866` |
| Region | `us-central1` |
| Cloud Run Service | `adk-platform-staging-api` |
| Service URL | https://adk-platform-staging-api-434169199874.us-central1.run.app |
| Cloud SQL Instance | `adk-platform-staging-db-936214e0` |
| Database | `adk_platform` |
| Database User | `adk_user` |

## Troubleshooting

### Migration Fails with Connection Error
- Ensure Cloud SQL Proxy is running and connected
- Check port 5434 is not in use: `lsof -i :5434`
- Verify database password from Secret Manager

### Cloud Run Returns 500
- Check Cloud Run logs: `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=adk-platform-staging-api" --limit=50`
- Verify secrets are accessible by service account
- Check DATABASE_URL secret is correct

### 403 Without Token
- Expected behavior - staging requires authentication
- Use `gcloud auth print-identity-token` for testing
- For service-to-service, use service account token

## Dependencies

- **Depends On**: Task 002 Phase 8 (Staging Infrastructure)
- **Blocks**: Task 002g (Production Deployment)

## Completion Results

### Completed: 2025-11-26

**Migrations Applied:**
- `001_tenant_isolation` - Initial schema with proper tenant isolation
- `69b9c231e4cb` - add_account_lockout_fields_to_users
- `eef9007a89c5` - add_refresh_tokens_table
- `06da01720794` - add_password_reset_tokens_table

**Docker Image:**
- Tag: `staging-f0cb8d2`
- Image: `us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform/api:staging-latest`
- Revision: `adk-platform-staging-api-00002-xlq`

**Verification Results:**
```
=== Health Check ===
{"status":"healthy","service":"adk-platform-api","version":"1.0.0"}
HTTP Status: 200

=== Readiness Check (DB connectivity) ===
{"status":"ready","database":"connected","service":"adk-platform-api"}
HTTP Status: 200

=== API Documentation ===
HTTP Status: 200
```

**Lessons Learned:**
1. Cloud SQL Proxy required `--gcloud-auth` flag when `GOOGLE_APPLICATION_CREDENTIALS` points to wrong project
2. Private VPC databases require temporary public IP enablement for local migrations (or use IAP tunneling)
3. Public IP was disabled after migrations completed to restore security posture

## Notes

- Staging uses `allow_unauthenticated_api = false` for security
- Database uses private VPC networking (no public IP)
- All secrets auto-generated except Google API key
