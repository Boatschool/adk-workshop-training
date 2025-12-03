# Task #002h: Monitoring and Alerting Setup

## Task Information

- **Task Number**: 002h
- **Parent Task**: 002 (Phase 8)
- **Task Name**: Monitoring and Alerting Setup
- **Priority**: MEDIUM
- **Estimated Effort**: 2-3 hours
- **Assigned To**: TBD
- **Created Date**: 2025-11-26
- **Due Date**: TBD
- **Status**: PENDING

## Description

Set up comprehensive monitoring dashboards and alerting policies for the ADK Platform across all environments (dev, staging, production). This includes Cloud Monitoring dashboards, alerting policies for critical metrics, uptime checks, and log-based alerts.

**Prerequisites:**
- Dev environment deployed (COMPLETE)
- Staging environment deployed (Task 002f)
- Production environment deployed (Task 002g)

## Acceptance Criteria

- [ ] Cloud Monitoring dashboard created for each environment
- [ ] Uptime checks configured for health endpoints
- [ ] Alerting policies for error rates, latency, and availability
- [ ] Log-based alerts for critical errors
- [ ] Budget alerts configured
- [ ] Notification channels configured (email, Slack optional)
- [ ] Runbook links added to alert policies

## Tasks

### 1. Create Notification Channels (~15 min)

Set up notification channels for alerts.

```bash
PROJECT_ID="adk-workshop-1763490866"

# Create email notification channel
gcloud alpha monitoring channels create \
  --display-name="ADK Platform Alerts - Email" \
  --type=email \
  --channel-labels=email_address=YOUR_EMAIL@example.com \
  --project=$PROJECT_ID

# List channels to get IDs
gcloud alpha monitoring channels list --project=$PROJECT_ID
```

### 2. Create Uptime Checks (~20 min)

Configure uptime monitoring for each environment.

```bash
# Dev environment uptime check
gcloud monitoring uptime create adk-platform-dev-health \
  --display-name="ADK Platform Dev - Health" \
  --resource-type=cloud-run-revision \
  --monitored-resource-labels="service_name=adk-platform-dev-api,location=us-central1" \
  --http-check-path="/health/" \
  --http-check-port=443 \
  --period=60s \
  --timeout=10s \
  --project=$PROJECT_ID

# Staging environment uptime check
gcloud monitoring uptime create adk-platform-staging-health \
  --display-name="ADK Platform Staging - Health" \
  --resource-type=cloud-run-revision \
  --monitored-resource-labels="service_name=adk-platform-staging-api,location=us-central1" \
  --http-check-path="/health/" \
  --http-check-port=443 \
  --period=60s \
  --timeout=10s \
  --project=$PROJECT_ID

# Production environment uptime check (more frequent)
gcloud monitoring uptime create adk-platform-prod-health \
  --display-name="ADK Platform Prod - Health" \
  --resource-type=cloud-run-revision \
  --monitored-resource-labels="service_name=adk-platform-prod-api,location=us-central1" \
  --http-check-path="/health/" \
  --http-check-port=443 \
  --period=60s \
  --timeout=10s \
  --project=$PROJECT_ID
```

### 3. Create Alerting Policies (~30 min)

#### 3.1 High Error Rate Alert

```yaml
# Save as alert-high-error-rate.yaml
displayName: "ADK Platform - High Error Rate"
combiner: OR
conditions:
  - displayName: "Error rate > 5%"
    conditionThreshold:
      filter: >
        resource.type="cloud_run_revision"
        AND metric.type="run.googleapis.com/request_count"
        AND metric.labels.response_code_class="5xx"
      comparison: COMPARISON_GT
      thresholdValue: 0.05
      duration: 300s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_RATE
          crossSeriesReducer: REDUCE_SUM
          groupByFields:
            - resource.label.service_name
notificationChannels:
  - projects/adk-workshop-1763490866/notificationChannels/CHANNEL_ID
documentation:
  content: |
    ## High Error Rate Alert

    Error rate exceeded 5% for Cloud Run service.

    ### Investigation Steps
    1. Check Cloud Run logs: `gcloud logging read "resource.type=cloud_run_revision"`
    2. Check recent deployments
    3. Verify database connectivity

    ### Runbook
    See: docs/deployment/runbook.md#troubleshooting
```

#### 3.2 High Latency Alert

```yaml
# Save as alert-high-latency.yaml
displayName: "ADK Platform - High Latency (p95 > 2s)"
combiner: OR
conditions:
  - displayName: "P95 latency > 2000ms"
    conditionThreshold:
      filter: >
        resource.type="cloud_run_revision"
        AND metric.type="run.googleapis.com/request_latencies"
      comparison: COMPARISON_GT
      thresholdValue: 2000
      duration: 300s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_PERCENTILE_95
          crossSeriesReducer: REDUCE_MAX
          groupByFields:
            - resource.label.service_name
notificationChannels:
  - projects/adk-workshop-1763490866/notificationChannels/CHANNEL_ID
```

#### 3.3 Cloud SQL High CPU Alert

```yaml
# Save as alert-cloudsql-cpu.yaml
displayName: "ADK Platform - Cloud SQL High CPU"
combiner: OR
conditions:
  - displayName: "CPU > 80%"
    conditionThreshold:
      filter: >
        resource.type="cloudsql_database"
        AND metric.type="cloudsql.googleapis.com/database/cpu/utilization"
      comparison: COMPARISON_GT
      thresholdValue: 0.8
      duration: 600s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_MEAN
```

#### 3.4 Uptime Check Failed Alert

```yaml
# Save as alert-uptime-failed.yaml
displayName: "ADK Platform - Uptime Check Failed"
combiner: OR
conditions:
  - displayName: "Health check failing"
    conditionThreshold:
      filter: >
        metric.type="monitoring.googleapis.com/uptime_check/check_passed"
        AND resource.type="uptime_url"
      comparison: COMPARISON_LT
      thresholdValue: 1
      duration: 120s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_FRACTION_TRUE
```

### 4. Create Cloud Monitoring Dashboard (~45 min)

Create a comprehensive dashboard via the Cloud Console or API.

**Dashboard Widgets:**

1. **Service Health Overview**
   - Request count (by status code)
   - Error rate percentage
   - P50/P95/P99 latency

2. **Cloud Run Metrics**
   - Instance count
   - CPU utilization
   - Memory utilization
   - Request latency distribution
   - Container startup latency

3. **Cloud SQL Metrics**
   - CPU utilization
   - Memory utilization
   - Disk utilization
   - Active connections
   - Query latency

4. **Application Metrics**
   - Requests by endpoint
   - Authentication failures
   - Tenant operations

```bash
# Create dashboard using JSON definition
cat > dashboard.json << 'EOF'
{
  "displayName": "ADK Platform - Overview",
  "gridLayout": {
    "columns": "2",
    "widgets": [
      {
        "title": "Request Count by Status",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_count\"",
                "aggregation": {
                  "alignmentPeriod": "60s",
                  "perSeriesAligner": "ALIGN_RATE",
                  "groupByFields": ["metric.label.response_code_class"]
                }
              }
            }
          }]
        }
      },
      {
        "title": "Request Latency (P95)",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_latencies\"",
                "aggregation": {
                  "alignmentPeriod": "60s",
                  "perSeriesAligner": "ALIGN_PERCENTILE_95"
                }
              }
            }
          }]
        }
      },
      {
        "title": "Cloud Run Instance Count",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/container/instance_count\"",
                "aggregation": {
                  "alignmentPeriod": "60s",
                  "perSeriesAligner": "ALIGN_MEAN"
                }
              }
            }
          }]
        }
      },
      {
        "title": "Cloud SQL CPU Utilization",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "resource.type=\"cloudsql_database\" AND metric.type=\"cloudsql.googleapis.com/database/cpu/utilization\"",
                "aggregation": {
                  "alignmentPeriod": "60s",
                  "perSeriesAligner": "ALIGN_MEAN"
                }
              }
            }
          }]
        }
      }
    ]
  }
}
EOF

gcloud monitoring dashboards create --config-from-file=dashboard.json --project=$PROJECT_ID
```

### 5. Create Log-Based Alerts (~20 min)

Alert on critical log patterns.

```bash
# Alert on application errors
gcloud logging metrics create adk-platform-errors \
  --description="Application error logs" \
  --log-filter='resource.type="cloud_run_revision" AND severity>=ERROR' \
  --project=$PROJECT_ID

# Alert on authentication failures
gcloud logging metrics create adk-platform-auth-failures \
  --description="Authentication failure logs" \
  --log-filter='resource.type="cloud_run_revision" AND textPayload=~"authentication failed"' \
  --project=$PROJECT_ID

# Alert on database connection errors
gcloud logging metrics create adk-platform-db-errors \
  --description="Database connection errors" \
  --log-filter='resource.type="cloud_run_revision" AND textPayload=~"database.*error|connection.*refused"' \
  --project=$PROJECT_ID
```

### 6. Configure Budget Alerts (~15 min)

Set up cost monitoring and alerts.

```bash
# Create budget via Console or API
# Go to: Billing > Budgets & alerts > Create budget

# Budget settings:
# - Name: ADK Platform Monthly Budget
# - Scope: Project adk-workshop-1763490866
# - Budget amount: $1000/month
# - Alert thresholds: 50%, 80%, 100%
# - Notification channel: Email
```

### 7. Document Monitoring Setup (~15 min)

Update runbook with monitoring information:

- Dashboard URLs
- Alert policy names
- Escalation procedures
- On-call contacts (if applicable)

## Alert Severity Matrix

| Alert | Severity | Response Time | Action |
|-------|----------|---------------|--------|
| Uptime check failed | CRITICAL | 5 min | Page on-call |
| Error rate > 10% | CRITICAL | 5 min | Page on-call |
| Error rate > 5% | HIGH | 15 min | Investigate |
| P95 latency > 2s | HIGH | 15 min | Investigate |
| Cloud SQL CPU > 80% | MEDIUM | 30 min | Review scaling |
| Budget > 80% | MEDIUM | 1 day | Review costs |

## Verification Checklist

After setup, verify:

- [ ] Uptime checks showing green for all environments
- [ ] Dashboard displays data for all metrics
- [ ] Test alert fires and notification received
- [ ] Log-based metrics collecting data
- [ ] Budget alerts configured

## Dependencies

- **Depends On**: Task 002g (Production Deployment)
- **Blocks**: Production go-live readiness

## Notes

- Free tier includes 1 million API calls/month for monitoring
- Uptime checks have a small cost (~$0.30/check/month)
- Consider PagerDuty/Opsgenie integration for production on-call
- Review alert thresholds after 1 week of production traffic
