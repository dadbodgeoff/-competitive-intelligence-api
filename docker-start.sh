#!/bin/bash
# Docker startup script with API verification

set -e  # Exit on error

echo "=================================="
echo "🚀 Starting Docker Containers"
echo "=================================="

# Step 1: Verify API endpoints
echo ""
echo "📋 Step 1: Verifying API endpoints..."
python verify_api_endpoints.py

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ API verification failed!"
    echo "Fix the issues above before starting Docker."
    exit 1
fi

echo ""
echo "✅ API verification passed!"

# Step 2: Start Docker containers
echo ""
echo "📋 Step 2: Starting Docker containers..."
docker-compose -f docker-compose.dev.yml up --build

echo ""
echo "✅ Docker containers started successfully!"
