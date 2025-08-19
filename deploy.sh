#!/bin/bash

# JAI-KISSAN AI Google Cloud Deployment Script
# This script deploys the backend to Google Cloud Run

set -e  # Exit on any error

echo "🚀 Starting JAI-KISSAN AI deployment to Google Cloud..."

# Configuration
PROJECT_ID="your-project-id"  # Replace with your actual project ID
REGION="us-central1"
SERVICE_NAME="jai-kissan-backend"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "Google Cloud SDK is not installed. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_warning "You are not authenticated with Google Cloud. Please run:"
    echo "gcloud auth login"
    exit 1
fi

# Set the project
print_status "Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
print_status "Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push the Docker image
print_status "Building and pushing Docker image..."
cd backend

# Build the image
docker build -t $IMAGE_NAME .

# Push to Container Registry
docker push $IMAGE_NAME

# Deploy to Cloud Run
print_status "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 10 \
    --timeout 300 \
    --set-env-vars "PYTHONPATH=/app,CHROMA_DB_IMPL=duckdb+parquet,PERSIST_DIRECTORY=/app/agri_chromadb"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

print_status "Deployment completed successfully! 🎉"
echo ""
echo "🌐 Your service is available at:"
echo "   $SERVICE_URL"
echo ""
echo "📊 To monitor your service:"
echo "   gcloud run services describe $SERVICE_NAME --region=$REGION"
echo ""
echo "🔍 To view logs:"
echo "   gcloud logs tail --service=$SERVICE_NAME --region=$REGION"
echo ""
echo "🛠️  To update environment variables:"
echo "   gcloud run services update $SERVICE_NAME --region=$REGION --set-env-vars KEY=VALUE"
echo ""

# Test the deployment
print_status "Testing the deployment..."
if curl -f "$SERVICE_URL/health" > /dev/null 2>&1; then
    print_status "✅ Health check passed! Service is running correctly."
else
    print_warning "⚠️  Health check failed. Please check the logs:"
    echo "   gcloud logs tail --service=$SERVICE_NAME --region=$REGION"
fi

cd ..

print_status "Deployment script completed!"
