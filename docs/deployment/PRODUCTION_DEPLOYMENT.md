# ADK Platform Production Deployment

**Last Updated:** 2025-11-27
**Status:** Fully Operational

## Overview

The ADK Platform is deployed across three environments (dev, staging, production) on Google Cloud Platform using Terraform-managed infrastructure. All environments are fully operational with database connectivity confirmed.

## Environment URLs

| Environment | API URL | Custom Domain | Status |
|-------------|---------|---------------|--------|
| **Production** | https://adk-platform-production-api-434169199874.us-central1.run.app | https://learn.graymatterlab.ai | Active |
| **Staging** | https://adk-platform-staging-api-434169199874.us-central1.run.app | - | Active |
| **Dev** | https://adk-platform-dev-api-434169199874.us-central1.run.app | - | Active |

## Custom Domain Configuration

### Domain: learn.graymatterlab.ai

| Setting | Value |
|---------|-------|
| Domain | `learn.graymatterlab.ai` |
| Target Service | `adk-platform-production-api` |
| DNS Record | CNAME → `ghs.googlehosted.com` |
| DNS Zone | `graymatterlab-ai` (project: `graymatter-studio`) |
| SSL Certificate | Google-managed (auto-provisioned) |
| Authentication | Required (IAP/Identity Token) |

### DNS Records (Cloud DNS)

```
learn.graymatterlab.ai.  CNAME  300  ghs.googlehosted.com.
```

The domain is verified via TXT record:
```
graymatterlab.ai.  TXT  "google-site-verification=wxdGa-2EGECUBYn2R25DHfInSIIXJXWfqKXTMgxV_Zk"
```

## Infrastructure Summary

### GCP Project
- **Project ID:** `adk-workshop-1763490866`
- **Region:** `us-central1`

### Resources Per Environment

| Resource | Dev | Staging | Production |
|----------|-----|---------|------------|
| **Terraform Resources** | 42 | 43 | 42 |
| **Cloud Run Service** | adk-platform-dev-api | adk-platform-staging-api | adk-platform-production-api |
| **Cloud SQL Instance** | adk-platform-dev-db-d086c20e | adk-platform-staging-db-936214e0 | adk-platform-production-db-faac9bed |
| **Database** | adk_platform | adk_platform | adk_platform |
| **Min Instances** | 0 | 1 | 2 |
| **Max Instances** | 5 | 10 | 100 |
| **CPU** | 1 | 1 | 2 |
| **Memory** | 512Mi | 1Gi | 2Gi |

### Cloud SQL Configuration

| Setting | Dev | Staging | Production |
|---------|-----|---------|------------|
| **Tier** | db-f1-micro | db-custom-2-4096 | db-custom-2-4096 |
| **RAM** | 0.6 GB | 4 GB | 4 GB |
| **Disk Size** | 10 GB | 20 GB | 100 GB |
| **High Availability** | No | No | No |
| **Private VPC** | No | Yes | Yes |
| **PostgreSQL Version** | 15 | 15 | 15 |

### Secret Manager Secrets

Each environment has the following secrets:
- `adk-platform-{env}-db-password` - Database password
- `adk-platform-{env}-database-url` - Full database connection string
- `adk-platform-{env}-jwt-secret-key` - JWT signing key
- `adk-platform-{env}-google-api-key` - Google API key for ADK

### Storage Buckets

Each environment has four Cloud Storage buckets:
- `adk-platform-{env}-static-{suffix}` - Static assets
- `adk-platform-{env}-uploads-{suffix}` - User uploads
- `adk-platform-{env}-logs-{suffix}` - Application logs
- `adk-platform-{env}-backups-{suffix}` - Database backups

## Authentication

All environments require authentication:
- `allow_unauthenticated_api = false`

### Testing with Identity Token

```bash
# Get identity token
TOKEN=$(gcloud auth print-identity-token)

# Test health endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://learn.graymatterlab.ai/health/

# Test readiness (DB connectivity)
curl -H "Authorization: Bearer $TOKEN" \
  https://learn.graymatterlab.ai/health/ready
```

### Expected Responses

**Health Check:**
```json
{"status":"healthy","service":"adk-platform-api","version":"1.0.0"}
```

**Readiness Check:**
```json
{"status":"ready","database":"connected","service":"adk-platform-api"}
```

## API Documentation

| Environment | Swagger UI | ReDoc |
|-------------|------------|-------|
| Production | https://workshop.graymatterlab.ai/docs | https://workshop.graymatterlab.ai/redoc |
| Staging | https://adk-platform-staging-api-434169199874.us-central1.run.app/docs | /redoc |
| Dev | https://adk-platform-dev-api-434169199874.us-central1.run.app/docs | /redoc |

## Deployment Commands

### Deploy to Production

```bash
cd /Users/ronwince/Desktop/adk-workshop-training

# Build and push Docker image
COMMIT_HASH=$(git rev-parse --short HEAD)
docker buildx build --platform linux/amd64 \
  -t us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform/api:prod-${COMMIT_HASH} \
  -t us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform/api:prod-latest \
  --push .

# Deploy to Cloud Run
gcloud run deploy adk-platform-production-api \
  --image=us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform/api:prod-latest \
  --region=us-central1 \
  --project=adk-workshop-1763490866
```

### Run Database Migrations (Production)

```bash
# Enable public IP temporarily
gcloud sql instances patch adk-platform-production-db-faac9bed \
  --assign-ip --project=adk-workshop-1763490866 --quiet

# Start Cloud SQL Proxy
DB_INSTANCE="adk-workshop-1763490866:us-central1:adk-platform-production-db-faac9bed"
./cloud_sql_proxy --port=5435 --gcloud-auth "$DB_INSTANCE" &

# Get password and run migrations
DB_PASSWORD=$(gcloud secrets versions access latest \
  --secret=adk-platform-production-db-password \
  --project=adk-workshop-1763490866 | tr -d '\n')

DATABASE_URL="postgresql+asyncpg://adk_user:${DB_PASSWORD}@localhost:5435/adk_platform" \
  poetry run alembic upgrade head

# Stop proxy and disable public IP
pkill -f "cloud_sql_proxy.*5435"
gcloud sql instances patch adk-platform-production-db-faac9bed \
  --no-assign-ip --project=adk-workshop-1763490866 --quiet
```

## Terraform Management

### Workspace Selection

```bash
cd infrastructure/terraform

# List workspaces
terraform workspace list

# Select workspace
terraform workspace select production  # or: dev, staging

# Plan changes
terraform plan -var-file=environments/production/terraform.tfvars

# Apply changes
terraform apply -var-file=environments/production/terraform.tfvars
```

### Configuration Files

| Environment | Config File |
|-------------|-------------|
| Dev | `infrastructure/terraform/environments/dev/terraform.tfvars` |
| Staging | `infrastructure/terraform/environments/staging/terraform.tfvars` |
| Production | `infrastructure/terraform/environments/production/terraform.tfvars` |

## Monitoring & Logs

### View Cloud Run Logs

```bash
# Production logs
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=adk-platform-production-api" \
  --limit=50 --project=adk-workshop-1763490866

# Staging logs
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=adk-platform-staging-api" \
  --limit=50 --project=adk-workshop-1763490866
```

### Cloud Console Links

- [Cloud Run Services](https://console.cloud.google.com/run?project=adk-workshop-1763490866)
- [Cloud SQL Instances](https://console.cloud.google.com/sql/instances?project=adk-workshop-1763490866)
- [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=adk-workshop-1763490866)
- [Domain Mappings](https://console.cloud.google.com/run/domains?project=adk-workshop-1763490866)

## Security Notes

1. **Authentication Required** - All environments require identity tokens
2. **Private VPC** - Staging and Production databases use private networking
3. **Secrets in Secret Manager** - No plaintext credentials in config
4. **CORS Restricted** - Production CORS should be updated in terraform.tfvars

## Migration History

Applied migrations across all environments:
1. `001_tenant_isolation` - Initial schema with multi-tenant support
2. `69b9c231e4cb` - Add account lockout fields to users
3. `eef9007a89c5` - Add refresh tokens table
4. `06da01720794` - Add password reset tokens table

## Troubleshooting

### Certificate Not Provisioning

Check domain mapping status:
```bash
gcloud beta run domain-mappings describe \
  --domain=workshop.graymatterlab.ai \
  --region=us-central1 \
  --project=adk-workshop-1763490866
```

### 403 Forbidden

Expected without authentication. Use identity token:
```bash
TOKEN=$(gcloud auth print-identity-token)
curl -H "Authorization: Bearer $TOKEN" https://workshop.graymatterlab.ai/health/
```

### Database Connection Issues

1. Check Cloud SQL instance status in console
2. Verify secrets have correct values
3. Check Cloud Run service account has `roles/cloudsql.client`

## Related Documentation

- [API Documentation](../api/README.md)
- [Task 002g - Production Infrastructure Deployment](../../tasks/task_002g_production_infrastructure_deployment.md)
- [Task 002f - Staging Operational Completion](../../tasks/task_002f_staging_operational_completion.md)
