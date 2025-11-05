#!/bin/bash
# Run backend tests only

set -e  # Exit on error

echo "=================================="
echo "BACKEND TESTS"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Error: backend/ directory not found"
    echo "   Run this script from tests/production/"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "⚠️  Virtual environment not found. Creating..."
    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Activate virtual environment
source backend/venv/bin/activate

# Run pytest with coverage
echo "Running pytest with coverage..."
echo ""

cd backend
pytest \
    --cov=../../api \
    --cov=../../services \
    --cov-report=html:../reports/backend-coverage \
    --cov-report=term \
    --verbose \
    --tb=short

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Backend tests passed!"
    echo "📊 Coverage report: tests/production/reports/backend-coverage/index.html"
    exit 0
else
    echo ""
    echo "❌ Backend tests failed!"
    exit 1
fi
