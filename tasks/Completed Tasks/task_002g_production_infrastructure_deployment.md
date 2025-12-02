# Task #002g: Production Infrastructure Deployment

## Task Information

- **Task Number**: 002g
- **Parent Task**: 002 (Phase 8)
- **Task Name**: Production Infrastructure Deployment
- **Priority**: HIGH
- **Estimated Effort**: 2-3 hours
- **Assigned To**: TBD
- **Created Date**: 2025-11-26
- **Due Date**: TBD
- **Status**: PENDING

## Description

Deploy the production environment infrastructure using Terraform. This includes all GCP resources configured for high-availability, increased capacity, and production-grade security. Production uses stronger database tiers, higher Cloud Run scaling limits, and stricter security policies.

**Prerequisites:**
- Dev environment deployed and verified (COMPLETE)
- Staging environment deployed and verified (Task 002f)
- GitHub secrets configured for CI/CD (COMPLETE)
- Production tfvars reviewed and approved

## Acceptance Criteria

- [ ] Terraform production workspace created
- [ ] All production infrastructure resources deployed via Terraform
- [ ] Cloud SQL instance running with HA enabled
- [ ] Cloud Run service deployed with production scaling (2-100 instances)
- [ ] Private VPC networking configured
- [ ] All secrets created in Secret Manager
- [ ] Database migrations applied to production
- [ ] Application deployed and health check passing
- [ ] Production URL accessible (with authentication)

## Production Configuration

### Resource Specifications

| Resource | Dev | Staging | **Production** |
|----------|-----|---------|----------------|
| **Cloud SQL Tier** | db-f1-micro | db-custom-2-4096 | **db-custom-4-16384** |
| **Database RAM** | 0.6 GB | 4 GB | **16 GB** |
| **Database vCPUs** | Shared | 2 | **4** |
| **Disk Size** | 10 GB | 20 GB | **100 GB** |
| **High Availability** | No | No | **Yes (Regional)** |
| **Cloud Run Min** | 0 | 1 | **2** |
| **Cloud Run Max** | 5 | 10 | **100** |
| **Cloud Run CPU** | 1 | 1 | **2** |
| **Cloud Run Memory** | 512Mi | 1Gi | **2Gi** |
| **Backup Retention** | 7 days | 7 days | **14 days** |
| **PITR** | No | No | **Yes** |

### Security Configuration

- `allow_unauthenticated_api = false` - Requires IAP or service auth
- Private VPC networking enabled
- Cloud SQL accessible only via VPC connector
- All secrets in Secret Manager (no plaintext)

## Tasks

### 1. Review Production Configuration (~15 min)

Review and validate the production terraform.tfvars before deployment.

```bash
cd /Users/ronwince/Desktop/adk-workshop-training/infrastructure/terraform

# Review production configuration
cat environments/production/terraform.tfvars

# Key settings to verify:
# - db_tier = "db-custom-4-16384"
# - db_high_availability = true
# - cloud_run_min_instances = 2
# - cloud_run_max_instances = 100
# - enable_private_networking = true
```

### 2. Create Production Terraform Workspace (~5 min)

```bash
cd /Users/ronwince/Desktop/adk-workshop-training/infrastructure/terraform

# List existing workspaces
terraform workspace list

# Create production workspace
terraform workspace new production

# Verify active workspace
terraform workspace show
# Should output: production
```

### 3. Plan Production Infrastructure (~10 min)

Generate and review the Terraform plan before applying.

```bash
# Initialize (if needed)
terraform init

# Generate plan
terraform plan \
  -var-file=environments/production/terraform.tfvars \
  -out=production.tfplan

# Review the plan carefully
# Expected: ~40-45 resources to create
```

**Review Checklist:**
- [ ] Cloud SQL instance with `db-custom-4-16384` tier
- [ ] Cloud SQL high availability enabled
- [ ] Cloud Run with min=2, max=100 instances
- [ ] VPC with private networking
- [ ] All 4 storage buckets
- [ ] All 4 secrets in Secret Manager
- [ ] IAM bindings for service accounts

### 4. Apply Production Infrastructure (~30-45 min)

Deploy all production resources. Cloud SQL HA instance takes 15-20 minutes.

```bash
# Apply the plan
terraform apply production.tfplan

# Or apply directly (with confirmation)
terraform apply -var-file=environments/production/terraform.tfvars

# Monitor progress - Cloud SQL HA takes longest
# Expected total time: 20-30 minutes
```

**Resources Created:**
- VPC network and subnet
- VPC connector for Cloud Run
- Firewall rules
- Private service connection
- Cloud SQL PostgreSQL 15 (HA)
- Cloud SQL database and user
- Secret Manager secrets (4)
- Cloud Storage buckets (4)
- Cloud Run service
- Service accounts and IAM bindings

### 5. Run Database Migrations (~15 min)

Apply Alembic migrations to production database.

```bash
# Get production database connection info
DB_INSTANCE=$(terraform output -raw cloud_sql_connection_name)
DB_PASSWORD=$(gcloud secrets versions access latest \
  --secret=adk-platform-prod-db-password \
  --project=adk-workshop-1763490866)

# Start Cloud SQL Proxy
./cloud_sql_proxy --port=5435 "$DB_INSTANCE" &
PROXY_PID=$!

# Run migrations
cd /Users/ronwince/Desktop/adk-workshop-training
DATABASE_URL="postgresql+asyncpg://adk_user:${DB_PASSWORD}@localhost:5435/adk_platform" \
  poetry run alembic upgrade head

# Stop proxy
kill $PROXY_PID
```

### 6. Set Production Google API Key (~5 min)

```bash
# Add production Google API key
echo -n "YOUR_PRODUCTION_GOOGLE_API_KEY" | gcloud secrets versions add \
  adk-platform-prod-google-api-key \
  --data-file=- \
  --project=adk-workshop-1763490866
```

### 7. Build and Deploy Production Image (~20 min)

```bash
cd /Users/ronwince/Desktop/adk-workshop-training

# Build for production
docker buildx build --platform linux/amd64 \
  -t us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform/api:prod-$(date +%Y%m%d-%H%M%S) \
  -t us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform/api:prod-latest \
  --push .

# Deploy to production Cloud Run
gcloud run deploy adk-platform-prod-api \
  --image=us-central1-docker.pkg.dev/adk-workshop-1763490866/adk-platform/api:prod-latest \
  --region=us-central1 \
  --project=adk-workshop-1763490866
```

### 8. Verify Production Deployment (~15 min)

```bash
# Get production URL
PROD_URL=$(terraform output -raw cloud_run_url)

# Get auth token
TOKEN=$(gcloud auth print-identity-token)

# Health check
curl -s -H "Authorization: Bearer $TOKEN" "$PROD_URL/health/"

# Readiness check (includes DB)
curl -s -H "Authorization: Bearer $TOKEN" "$PROD_URL/health/ready"

# API docs
curl -s -H "Authorization: Bearer $TOKEN" "$PROD_URL/docs" | head -5
```

### 9. Document Production Endpoints (~10 min)

Update documentation with production URLs and connection details.

## Terraform Outputs

After successful deployment, capture these outputs:

```bash
terraform output

# Expected outputs:
# cloud_run_url = "https://adk-platform-prod-api-XXXXX.run.app"
# cloud_sql_connection_name = "project:region:instance"
# cloud_sql_ip = "x.x.x.x"
# vpc_connector_id = "projects/.../connectors/..."
```

## Rollback Plan

If production deployment fails:

```bash
# Option 1: Destroy and recreate
terraform destroy -var-file=environments/production/terraform.tfvars

# Option 2: Rollback to previous Cloud Run revision
gcloud run services update-traffic adk-platform-prod-api \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=us-central1

# Option 3: Database rollback
DATABASE_URL="..." poetry run alembic downgrade -1
```

## Cost Estimate

| Resource | Monthly Cost (Est.) |
|----------|---------------------|
| Cloud SQL (db-custom-4-16384, HA) | ~$400-500 |
| Cloud Run (2-100 instances) | ~$50-200 |
| Cloud Storage (100GB) | ~$5 |
| Secret Manager | ~$5 |
| VPC/Networking | ~$20 |
| **Total** | **~$500-750/month** |

## Dependencies

- **Depends On**: Task 002f (Staging Operational Completion)
- **Blocks**: Production go-live

## Notes

- Production Cloud SQL HA requires 15-20 minutes to provision
- Use Committed Use Discounts for 30% savings on Cloud SQL
- Consider enabling Cloud Armor WAF after initial deployment
- Set up budget alerts at 50%, 80%, 100% of monthly estimate
