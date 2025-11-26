# ADR 003: Cloud Run over GKE

## Status

**Accepted** - 2025-11-20

## Context

We needed to select a compute platform on Google Cloud Platform for hosting the ADK Platform API. The two primary options were:

- **Cloud Run**: Serverless container platform
- **GKE (Google Kubernetes Engine)**: Managed Kubernetes

Requirements:
- Auto-scaling based on request load
- Cost-efficient for variable traffic patterns
- Minimal operational overhead
- Support for containerized Python applications
- Integration with Cloud SQL, Secret Manager, and other GCP services

## Decision

We chose **Cloud Run** as our compute platform.

## Rationale

### Operational Simplicity

Cloud Run provides a simpler operational model:

| Aspect | Cloud Run | GKE |
|--------|-----------|-----|
| Cluster management | None | Required |
| Node upgrades | Automatic | Manual or automated |
| Scaling configuration | Simple knobs | Complex HPA/VPA |
| Networking | Automatic | Manual VPC/Ingress setup |
| SSL certificates | Automatic | Manual cert-manager |

### Cost Model

Cloud Run is more cost-effective for our workload:

- **Pay per request**: No cost when idle
- **Scale to zero**: Development environments cost nothing when not in use
- **No cluster fees**: GKE has ~$70/month baseline for cluster management
- **Efficient scaling**: Scales in seconds, not minutes

Estimated costs for 100 tenants:
- Cloud Run: ~$200-400/month
- GKE: ~$500-800/month (including cluster fee + nodes)

### Deployment Simplicity

```bash
# Cloud Run deployment (one command)
gcloud run deploy api --image gcr.io/project/api:latest --region us-central1

# GKE deployment (multiple steps)
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f certificate.yaml
```

### GCP Integration

Cloud Run has first-class integration with:
- **Cloud SQL**: Via Cloud SQL Proxy sidecar (automatic)
- **Secret Manager**: Native secret mounting
- **Cloud Logging**: Automatic log export
- **Cloud Trace**: Automatic request tracing
- **IAM**: Service account identity

### Suitable for Our Workload

Our workload characteristics favor Cloud Run:
- **HTTP/API traffic**: Request/response pattern
- **Stateless**: No local state between requests
- **Short-lived**: Requests complete in seconds
- **Variable load**: Traffic varies by time of day

## Consequences

### Positive

- **Lower ops burden**: No cluster to manage
- **Cost savings**: Pay only for actual usage
- **Fast deployments**: Rolling updates in seconds
- **Auto-scaling**: Handles traffic spikes automatically
- **Built-in features**: SSL, CDN, load balancing

### Negative

- **Cold starts**: First request after idle takes 2-5 seconds
  - Mitigation: Set `min-instances=1` for production
- **Request timeout**: Max 60 minutes (default 5 minutes)
  - Acceptable for API workloads
- **Limited customization**: Cannot modify underlying infrastructure
- **Resource limits**: Max 8 vCPU, 32GB RAM per instance

### When to Reconsider

Consider GKE if we need:
- Long-running background processes (>60 minutes)
- GPU workloads for ML inference
- Complex service mesh requirements
- WebSocket connections (supported but limited)
- Custom networking configurations

## Alternatives Considered

### GKE Standard

**Pros:**
- Full Kubernetes flexibility
- Larger instance types available
- Custom networking

**Cons:**
- Significant operational overhead
- Higher baseline cost
- Slower scaling
- Steeper learning curve

### GKE Autopilot

**Pros:**
- Reduced ops vs Standard GKE
- Pod-level billing
- Automatic node management

**Cons:**
- Still more complex than Cloud Run
- Some Kubernetes limitations
- Higher cost than Cloud Run for our workload

### Compute Engine (VMs)

**Pros:**
- Full control
- Familiar model

**Cons:**
- Manual scaling
- Higher operational burden
- Fixed costs regardless of traffic

## Configuration

Our Cloud Run configuration:

```yaml
# Production settings
min_instances: 2        # Always warm
max_instances: 100      # Scale limit
cpu: 2                  # 2 vCPU
memory: 2Gi             # 2 GB RAM
concurrency: 80         # Requests per instance
timeout: 300s           # 5 minute timeout
```

## References

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [When to use Cloud Run vs GKE](https://cloud.google.com/blog/topics/developers-practitioners/cloud-run-story-serverless-containers)
- Terraform configuration: `infrastructure/terraform/modules/cloud_run/`
