# BuyWhere Frontend Deployment

## GCP Authentication: Workload Identity Federation (WIF)

The GitHub Actions deploy workflow uses **Workload Identity Federation** for keyless authentication to GCP. No service account keys are stored.

### One-Time GCP Setup (already completed if deploys work)

If WIF needs to be set up or re-established:

```bash
PROJECT_ID="buywhere-site-production"
SA_NAME="buywhere-github-deployer"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
POOL_NAME="github-actions-pool"
PROVIDER_NAME="github-actions-provider"
GITHUB_ORG="BuyWhere"
GITHUB_REPO="buywhere"

gcloud config set project "${PROJECT_ID}"

# 1. Create service account
gcloud iam service-accounts create "${SA_NAME}" \
    --display-name="GitHub Actions deployer for Cloud Run" \
    --project="${PROJECT_ID}"

# 2. Grant required roles
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

# 3. Create workload identity pool
gcloud iam workload-identity-pools create "${POOL_NAME}" \
    --location="global" \
    --project="${PROJECT_ID}"

# 4. Create OIDC provider for GitHub
gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_NAME}" \
    --location="global" \
    --workload-identity-pool="${POOL_NAME}" \
    --project="${PROJECT_ID}" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com"

# 5. Bind the service account to GitHub repo
gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
    --project="${PROJECT_ID}" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${GITHUB_ORG}/${GITHUB_REPO}"

# 6. Get the provider resource name and add as GitHub secret
gcloud iam workload-identity-pools providers describe "${PROVIDER_NAME}" \
    --location="global" \
    --workload-identity-pool="${POOL_NAME}" \
    --project="${PROJECT_ID}" \
    --format="value(name)"
```

### GitHub Secrets Required

Set these in the repository **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `GCP_WIF_PROVIDER` | Full provider resource name from step 6 above |
| `GCP_WIF_SERVICE_ACCOUNT` | `buywhere-github-deployer@buywhere-site-production.iam.gserviceaccount.com` |

---

## Root Cause (Historical)

The production site `buywhere.ai` (behind Cloudflare, proxied to Google Cloud Run) was returning HTTP 404. The Cloud Run service `buywhere-site-production` was serving a broken Next.js application that cannot find its pages.

## Fix

Deploy the working Express-based frontend server (`buywhere-frontend-server.js`) which serves a complete, self-contained HTML page with all BuyWhere content inline.

## Local / Manual Deploy

- `gcloud` CLI installed and authenticated
- Access to the `buywhere-site-production` GCP project
- Docker (or use Cloud Build, which is the default)

### Quick Deploy

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
