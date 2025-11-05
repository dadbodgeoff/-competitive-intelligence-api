#!/bin/bash
# Quick script to run E2E auth tests

echo "🔒 Running E2E Auth Test Suite..."
echo ""

# Check if dependencies are installed
if ! python -c "import pytest" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r tests/e2e_auth/requirements.txt
    playwright install
fi

# Run tests
python tests/e2e_auth/test_runner.py

# Show report location
echo ""
echo "📊 View HTML report: tests/e2e_auth/reports/report.html"
