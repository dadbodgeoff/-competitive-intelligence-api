#!/bin/bash
# Production deployment script

set -e

echo "🚀 Starting production deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production not found"
    echo "Copy .env.production.example and fill in your values"
    exit 1
fi

# Load production environment
export $(cat .env.production | grep -v '^#' | xargs)

# Build production image
echo "📦 Building production image..."
docker-compose -f docker-compose.yml build --no-cache

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.yml down

# Start new containers
echo "▶️  Starting new containers..."
docker-compose -f docker-compose.yml up -d

# Wait for health check
echo "🏥 Waiting for health check..."
sleep 10

# Check if API is healthy
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    echo "API is running at http://localhost:8000"
else
    echo "❌ Health check failed"
    echo "Check logs with: docker-compose -f docker-compose.yml logs api"
    exit 1
fi

# Show running containers
docker-compose -f docker-compose.yml ps
