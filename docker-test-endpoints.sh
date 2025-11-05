#!/bin/bash
# Comprehensive API endpoint testing (requires Docker to be running)

set -e

echo "=================================="
echo "🧪 Testing API Endpoints"
echo "=================================="

echo ""
echo "This script tests:"
echo "  1. Code patterns (static analysis)"
echo "  2. Live API endpoints (requires backend running)"
echo ""

python verify_api_endpoints_comprehensive.py

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Tests failed!"
    exit 1
fi

echo ""
echo "✅ All tests passed!"
