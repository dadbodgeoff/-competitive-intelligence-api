#!/bin/bash
# Development environment startup script

set -e

echo "🔧 Starting development environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env not found"
    echo "Copy .env.example and fill in your values"
    exit 1
fi

# Start dev containers
echo "▶️  Starting containers with hot reload..."
docker-compose -f docker-compose.dev.yml up --build

# Cleanup on exit
trap "docker-compose -f docker-compose.dev.yml down" EXIT
