# Task #006: Frontend Deployment to GCP with Cloud Storage + Load Balancer

## Task Information

- **Task Number**: 006
- **Task Name**: Frontend Deployment to GCP (Cloud Storage + Load Balancer)
- **Priority**: HIGH
- **Estimated Effort**: 1-2 days
- **Created Date**: 2025-11-29
- **Status**: PENDING
- **Depends On**: Task #005 (Standalone Auth - COMPLETED)

## Executive Summary

Deploy the React frontend to Google Cloud Platform using Cloud Storage for static file hosting with a Global HTTPS Load Balancer and Cloud CDN for optimal performance. This completes the production deployment by adding the frontend alongside the already-deployed FastAPI backend.

## Current State

### What's Deployed
| Component | Status | URL |
|-----------|--------|-----|
| FastAPI Backend (Staging) | DEPLOYED | https://adk-platform-staging-api-mjwk2v5aqq-uc.a.run.app |
| FastAPI Backend (Production) | DEPLOYED | https://adk-platform-production-api-mjwk2v5aqq-uc.a.run.app |
| Cloud SQL (Staging) | DEPLOYED | adk-platform-staging-db-* |
| Cloud SQL (Production) | DEPLOYED | adk-platform-production-db-faac9bed |
| GCS Buckets | CREATED | adk-platform-{env}-static-* (unused) |
| React Frontend | LOCAL ONLY | http://localhost:4000 |

### What's Missing
- HTTPS Load Balancer for frontend
- Cloud CDN configuration
- Frontend build/deploy pipeline
- Custom domain setup (learn.graymatterlab.ai)
- SSL certificate provisioning

## Architecture Overview

```
                                    ┌─────────────────────────────────────────────────┐
                                    │                  Google Cloud                    │
                                    │                                                  │
    Users ──────► Global HTTPS ─────┼──► Cloud CDN ──► GCS Static Bucket              │
                  Load Balancer     │                   (React SPA)                    │
                       │            │                                                  │
                       │            │    ┌──────────────────────────────────┐         │
                       └────────────┼───►│  Cloud Run (FastAPI Backend)     │         │
                    /api/* routes   │    │  - API endpoints                 │         │
                                    │    │  - Auth, Users, Workshops        │         │
                                    │    └──────────────────────────────────┘         │
                                    │                      │                           │
                                    │                      ▼                           │
                                    │    ┌──────────────────────────────────┐         │
                                    │    │  Cloud SQL (PostgreSQL)          │         │
                                    │    │  - Multi-tenant schemas          │         │
                                    │    └──────────────────────────────────┘         │
                                    └─────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Terraform Infrastructure (Load Balancer Module)

#### 1.1 Create Load Balancer Terraform Module

**New Directory**: `infrastructure/terraform/modules/load_balancer/`

**Files to Create**:
- `main.tf` - Load balancer resources
- `variables.tf` - Input variables
- `outputs.tf` - Output values

```hcl
# infrastructure/terraform/modules/load_balancer/main.tf

# Reserve a global static IP
resource "google_compute_global_address" "frontend" {
  name    = "${var.name_prefix}-frontend-ip"
  project = var.project_id
}

# Backend bucket pointing to GCS static bucket
resource "google_compute_backend_bucket" "frontend" {
  name        = "${var.name_prefix}-frontend-backend"
  project     = var.project_id
  bucket_name = var.static_bucket_name
  enable_cdn  = true

  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    default_ttl       = 3600
    max_ttl           = 86400
    client_ttl        = 3600
    negative_caching  = true
  }
}

# URL map to route requests
resource "google_compute_url_map" "frontend" {
  name            = "${var.name_prefix}-frontend-urlmap"
  project         = var.project_id
  default_service = google_compute_backend_bucket.frontend.id

  # Route /api/* to Cloud Run backend
  host_rule {
    hosts        = ["*"]
    path_matcher = "api-matcher"
  }

  path_matcher {
    name            = "api-matcher"
    default_service = google_compute_backend_bucket.frontend.id

    path_rule {
      paths   = ["/api/*", "/health/*"]
      service = google_compute_backend_service.api.id
    }
  }
}

# Backend service for Cloud Run API
resource "google_compute_backend_service" "api" {
  name        = "${var.name_prefix}-api-backend"
  project     = var.project_id
  protocol    = "HTTPS"
  timeout_sec = 30

  backend {
    group = google_compute_region_network_endpoint_group.api_neg.id
  }
}

# Network Endpoint Group for Cloud Run
resource "google_compute_region_network_endpoint_group" "api_neg" {
  name                  = "${var.name_prefix}-api-neg"
  project               = var.project_id
  region                = var.region
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = var.cloud_run_service_name
  }
}

# Managed SSL certificate
resource "google_compute_managed_ssl_certificate" "frontend" {
  name    = "${var.name_prefix}-frontend-cert"
  project = var.project_id

  managed {
    domains = var.domains
  }
}

# HTTPS proxy
resource "google_compute_target_https_proxy" "frontend" {
  name             = "${var.name_prefix}-frontend-https-proxy"
  project          = var.project_id
  url_map          = google_compute_url_map.frontend.id
  ssl_certificates = [google_compute_managed_ssl_certificate.frontend.id]
}

# Global forwarding rule
resource "google_compute_global_forwarding_rule" "frontend_https" {
  name        = "${var.name_prefix}-frontend-https"
  project     = var.project_id
  target      = google_compute_target_https_proxy.frontend.id
  port_range  = "443"
  ip_address  = google_compute_global_address.frontend.address
  ip_protocol = "TCP"
}

# HTTP redirect to HTTPS
resource "google_compute_url_map" "http_redirect" {
  name    = "${var.name_prefix}-http-redirect"
  project = var.project_id

  default_url_redirect {
    https_redirect = true
    strip_query    = false
  }
}

resource "google_compute_target_http_proxy" "http_redirect" {
  name    = "${var.name_prefix}-http-redirect-proxy"
  project = var.project_id
  url_map = google_compute_url_map.http_redirect.id
}

resource "google_compute_global_forwarding_rule" "frontend_http" {
  name        = "${var.name_prefix}-frontend-http"
  project     = var.project_id
  target      = google_compute_target_http_proxy.http_redirect.id
  port_range  = "80"
  ip_address  = google_compute_global_address.frontend.address
  ip_protocol = "TCP"
}
```

#### 1.2 Update Storage Module for Public Access

**Update**: `infrastructure/terraform/modules/storage/main.tf`

Make static bucket publicly readable for production:

```hcl
# Make static bucket publicly readable (required for Load Balancer)
resource "google_storage_bucket_iam_member" "static_public_read" {
  bucket = google_storage_bucket.static.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}
```

#### 1.3 Update Main Terraform

**Update**: `infrastructure/terraform/main.tf`

Add load balancer module:

```hcl
module "load_balancer" {
  source = "./modules/load_balancer"

  project_id             = var.project_id
  region                 = var.region
  name_prefix            = local.name_prefix
  static_bucket_name     = module.storage.static_bucket_name
  cloud_run_service_name = module.cloud_run.service_name
  domains                = var.frontend_domains

  depends_on = [module.storage, module.cloud_run]
}
```

#### 1.4 Add New Variables

**Update**: `infrastructure/terraform/variables.tf`

```hcl
variable "frontend_domains" {
  description = "Domain names for frontend SSL certificate"
  type        = list(string)
  default     = []
}
```

**Update**: Environment tfvars files:

```hcl
# staging/terraform.tfvars
frontend_domains = ["staging.learn.graymatterlab.ai"]

# production/terraform.tfvars
frontend_domains = ["learn.graymatterlab.ai"]
```

### Phase 2: Frontend Build Configuration

#### 2.1 Update Vite Config for Production

**Update**: `frontend/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },
  // Production API is on same domain via Load Balancer
  // Dev uses proxy
  server: {
    port: 4000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
      '/health': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

#### 2.2 Create Frontend Build Script

**New File**: `scripts/deploy-frontend.sh`

```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-staging}
PROJECT_ID="adk-workshop-1763490866"

echo "Building frontend for ${ENVIRONMENT}..."

cd frontend
npm ci
npm run build

echo "Deploying to GCS..."
BUCKET_NAME=$(gcloud storage buckets list --project=$PROJECT_ID --format="value(name)" | grep "adk-platform-${ENVIRONMENT}-static")

if [ -z "$BUCKET_NAME" ]; then
  echo "Error: Static bucket not found for ${ENVIRONMENT}"
  exit 1
fi

# Upload with cache headers
gsutil -m rsync -r -d dist/ gs://${BUCKET_NAME}/

# Set cache headers for different file types
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" "gs://${BUCKET_NAME}/assets/**"
gsutil -m setmeta -h "Cache-Control:no-cache, no-store, must-revalidate" "gs://${BUCKET_NAME}/index.html"

echo "Frontend deployed to gs://${BUCKET_NAME}/"
echo "URL: https://learn.graymatterlab.ai (after DNS setup)"
```

#### 2.3 Configure SPA Routing

**Create**: `frontend/public/_redirects` or configure in GCS

For SPA routing (all paths return index.html), configure the URL map:

```hcl
# In load_balancer/main.tf - update url_map

resource "google_compute_url_map" "frontend" {
  # ... existing config ...

  # SPA fallback - serve index.html for all non-file paths
  default_url_redirect {
    path_redirect = "/index.html"
  }
}
```

Or use a custom error page configuration:

```hcl
resource "google_storage_bucket" "static" {
  # ... existing config ...

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"  # SPA fallback
  }
}
```

### Phase 3: DNS and SSL Configuration

#### 3.1 Reserve Static IP and Get Address

After terraform apply:

```bash
gcloud compute addresses describe adk-platform-production-frontend-ip --global --format="value(address)"
```

#### 3.2 Configure DNS Records

In your DNS provider (e.g., Cloudflare, Route53), add:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | learn.graymatterlab.ai | <static-ip> | 300 |
| A | staging.learn.graymatterlab.ai | <staging-static-ip> | 300 |

#### 3.3 Wait for SSL Certificate Provisioning

Google-managed SSL certificates can take 15-60 minutes to provision. Monitor:

```bash
gcloud compute ssl-certificates describe adk-platform-production-frontend-cert --global
```

### Phase 4: CI/CD Pipeline Updates

#### 4.1 Update GitHub Actions Workflow

**Update**: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Auth to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Build and push backend
        run: |
          gcloud builds submit --tag gcr.io/$PROJECT_ID/adk-platform-api
          gcloud run deploy adk-platform-production-api \
            --image gcr.io/$PROJECT_ID/adk-platform-api \
            --region us-central1

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v4

      - name: Auth to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Build frontend
        working-directory: frontend
        run: |
          npm ci
          npm run build

      - name: Deploy to GCS
        run: |
          gsutil -m rsync -r -d frontend/dist/ gs://adk-platform-production-static-*/
          gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" "gs://adk-platform-production-static-*/assets/**"
          gsutil -m setmeta -h "Cache-Control:no-cache" "gs://adk-platform-production-static-*/index.html"

      - name: Invalidate CDN cache
        run: |
          gcloud compute url-maps invalidate-cdn-cache adk-platform-production-frontend-urlmap --path "/*"
```

### Phase 5: Environment Configuration

#### 5.1 Production Environment Variables

Frontend needs to know API is on same domain in production:

**Update**: `frontend/.env.production`

```bash
# API is served from same domain via Load Balancer
VITE_API_BASE_URL=
```

**Update**: `frontend/.env.development`

```bash
# Local development - API on different port
VITE_API_URL=http://localhost:8080
```

#### 5.2 Backend CORS Configuration

**Update**: `src/api/main.py`

Ensure CORS allows the production domain:

```python
CORS_ORIGINS = [
    "https://learn.graymatterlab.ai",
    "https://staging.learn.graymatterlab.ai",
    "http://localhost:4000",  # Dev
]
```

## Deployment Steps

### Step 1: Apply Terraform Changes

```bash
cd infrastructure/terraform

# Staging first
terraform workspace select staging
terraform plan -var-file=environments/staging/terraform.tfvars
terraform apply -var-file=environments/staging/terraform.tfvars

# Then production
terraform workspace select production
terraform plan -var-file=environments/production/terraform.tfvars
terraform apply -var-file=environments/production/terraform.tfvars
```

### Step 2: Get Static IPs

```bash
# Get staging IP
terraform workspace select staging
terraform output -raw frontend_ip

# Get production IP
terraform workspace select production
terraform output -raw frontend_ip
```

### Step 3: Configure DNS

Add A records pointing to the static IPs.

### Step 4: Wait for SSL

Monitor certificate status (15-60 minutes):

```bash
gcloud compute ssl-certificates list --global
```

### Step 5: Deploy Frontend

```bash
# Deploy to staging
./scripts/deploy-frontend.sh staging

# Test staging
curl https://staging.learn.graymatterlab.ai

# Deploy to production
./scripts/deploy-frontend.sh production
```

### Step 6: Verify Deployment

```bash
# Test frontend
curl -I https://learn.graymatterlab.ai

# Test API routing
curl https://learn.graymatterlab.ai/api/v1/health/

# Test CDN caching
curl -I https://learn.graymatterlab.ai/assets/index-*.js
# Should see: x-goog-cache-status: HIT
```

## Cost Estimate

| Resource | Monthly Cost (Estimate) |
|----------|------------------------|
| Global HTTPS Load Balancer | ~$18/month base |
| Cloud CDN egress | ~$0.08/GB (first 10TB) |
| GCS storage | ~$0.02/GB |
| SSL Certificate | Free (Google-managed) |
| **Total (low traffic)** | **~$20-25/month** |

Note: Load Balancer has a minimum cost regardless of traffic. For very low traffic, Firebase Hosting ($0/month for small sites) could be an alternative.

## Acceptance Criteria

### Must Have
- [ ] Frontend accessible via HTTPS at custom domain
- [ ] API requests (/api/*) routed to Cloud Run backend
- [ ] HTTP redirects to HTTPS
- [ ] CDN caching working for static assets
- [ ] SPA routing works (deep links return index.html)
- [ ] SSL certificate valid and auto-renewing

### Should Have
- [ ] CI/CD pipeline deploys frontend automatically
- [ ] CDN cache invalidation on deploy
- [ ] Staging environment with separate domain

### Nice to Have
- [ ] Custom error pages (404, 500)
- [ ] Brotli compression
- [ ] Security headers (CSP, HSTS) via Cloud Armor

## Rollback Plan

1. **Frontend rollback**: Re-deploy previous version from git
   ```bash
   git checkout <previous-commit>
   ./scripts/deploy-frontend.sh production
   ```

2. **Infrastructure rollback**: Revert terraform
   ```bash
   git checkout <previous-commit> -- infrastructure/terraform/
   terraform apply
   ```

3. **Emergency**: Point DNS to Cloud Run URL directly (bypasses LB)

## Dependencies

- GCP project with billing enabled
- DNS access for graymatterlab.ai domain
- Terraform state backend configured
- GitHub Actions secrets configured

## Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Terraform | 2-3 hours | Load Balancer infrastructure |
| Phase 2: Build Config | 1 hour | Frontend build scripts |
| Phase 3: DNS/SSL | 1-2 hours | Domain configuration |
| Phase 4: CI/CD | 1-2 hours | Automated deployments |
| Phase 5: Testing | 1-2 hours | Verification and tuning |

**Total: 1-2 days**

## Notes

- Load Balancer provisioning takes 5-10 minutes
- SSL certificate provisioning can take up to 60 minutes
- CDN cache propagation takes a few minutes globally
- First request after deploy may be slow (CDN cache miss)
