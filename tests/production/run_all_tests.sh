#!/bin/bash
# Run all production tests (backend + frontend)

set -e  # Exit on error

echo "=================================="
echo "PRODUCTION TEST SUITE - ALL TESTS"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
BACKEND_PASSED=0
FRONTEND_PASSED=0

# Run backend tests
echo "📦 Running Backend Tests..."
echo ""
if ./run_backend_tests.sh; then
    echo -e "${GREEN}✅ Backend tests PASSED${NC}"
    BACKEND_PASSED=1
else
    echo -e "${RED}❌ Backend tests FAILED${NC}"
fi

echo ""
echo "=================================="
echo ""

# Run frontend tests
echo "🎨 Running Frontend Tests..."
echo ""
if ./run_frontend_tests.sh; then
    echo -e "${GREEN}✅ Frontend tests PASSED${NC}"
    FRONTEND_PASSED=1
else
    echo -e "${RED}❌ Frontend tests FAILED${NC}"
fi

echo ""
echo "=================================="
echo "FINAL RESULTS"
echo "=================================="
echo ""

if [ $BACKEND_PASSED -eq 1 ] && [ $FRONTEND_PASSED -eq 1 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    [ $BACKEND_PASSED -eq 0 ] && echo "  - Backend tests failed"
    [ $FRONTEND_PASSED -eq 0 ] && echo "  - Frontend tests failed"
    echo ""
    exit 1
fi
