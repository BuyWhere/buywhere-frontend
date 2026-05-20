# BuyWhere Frontend Deployment Fix

## Root Cause

The production site `buywhere.ai` (behind Cloudflare, proxied to Google Cloud Run) returns HTTP 404. The Cloud Run service `buywhere-site-production` is serving a broken Next.js application that cannot find its pages.

## Fix

Deploy the working Express-based frontend server (`buywhere-frontend-server.js`) which serves a complete, self-contained HTML page with all BuyWhere content inline.

## Prerequisites

- `gcloud` CLI installed and authenticated
- Access to the `buywhere-site-production` GCP project
- Docker (or use Cloud Build, which is the default)

## Quick Deploy

```bash
# Authenticate
gcloud auth login

# Set project
gcloud config set project buywhere-site-production

# Run the deploy script
./deploy-cloud-run.sh
```

## Manual Steps

### 1. Build and push the Docker image

```bash
export PROJECT_ID="buywhere-site-production"
export IMAGE="gcr.io/${PROJECT_ID}/buywhere-frontend:$(date +%s)"

gcloud builds submit \
  --project="${PROJECT_ID}" \
  --tag="${IMAGE}" \
  --timeout=600s
```

### 2. Deploy to Cloud Run

```bash
gcloud run deploy buywhere-site-production \
  --project="${PROJECT_ID}" \
  --image="${IMAGE}" \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=256Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=80 \
  --timeout=300s
```

### 3. Verify

```bash
# Get the Cloud Run URL
SERVICE_URL=$(gcloud run services describe buywhere-site-production \
  --project="${PROJECT_ID}" \
  --region=us-central1 \
  --format='value(status.url)')

# Check health endpoint
curl -s "${SERVICE_URL}/health"

# Check that HTML contains BuyWhere content
curl -s "${SERVICE_URL}" | grep -c "BuyWhere"
```

## Rollback (if needed)

```bash
gcloud run services update-traffic buywhere-site-production \
  --project="${PROJECT_ID}" \
  --region=us-central1 \
  --to-latest=false
```

## Validation

After deployment, the health check should pass:
- HTTP 200
- Response body contains "BuyWhere"
- Cloudflare DNS resolves correctly
