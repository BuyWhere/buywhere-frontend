#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-buywhere-site-production}"
SERVICE_NAME="${CLOUD_RUN_SERVICE:-buywhere-site-production}"
REGION="${GCP_REGION:-us-central1}"
IMAGE_NAME="gcr.io/${PROJECT_ID}/buywhere-frontend:$(date +%s)"

echo "=== BuyWhere Frontend Cloud Run Deployment ==="
echo "Project: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region:  ${REGION}"
echo "Image:   ${IMAGE_NAME}"
echo ""

# Step 1: Build the Docker image
echo ">>> Building Docker image..."
gcloud builds submit \
  --project="${PROJECT_ID}" \
  --tag="${IMAGE_NAME}" \
  --timeout=600s

# Step 2: Deploy to Cloud Run
echo ">>> Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --image="${IMAGE_NAME}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=256Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=80 \
  --timeout=300s \
  --set-env-vars="NODE_ENV=production"

echo ""
echo "=== Deployment complete ==="
echo "Service URL: https://${SERVICE_NAME}-${PROJECT_ID}-${REGION}.a.run.app"
echo ""
echo "To verify:"
echo "  curl -s https://${SERVICE_NAME}-${PROJECT_ID}-${REGION}.a.run.app/health"
echo ""
echo "DNS (Cloudflare) should point to this Cloud Run URL."
echo "Check Cloudflare dashboard or use:"
echo "  curl -s https://buywhere.ai | head -5"
