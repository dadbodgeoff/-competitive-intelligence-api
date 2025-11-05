#!/bin/bash
# Run frontend tests only

set -e  # Exit on error

echo "=================================="
echo "FRONTEND TESTS"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend/ directory not found"
    echo "   Run this script from tests/production/"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Run tests
echo "Running frontend tests..."
echo ""

cd frontend
npm test -- --coverage --coverageDirectory=../reports/frontend-coverage

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Frontend tests passed!"
    echo "📊 Coverage report: tests/production/reports/frontend-coverage/index.html"
    exit 0
else
    echo ""
    echo "❌ Frontend tests failed!"
    exit 1
fi
