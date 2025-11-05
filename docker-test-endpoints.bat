@echo off
REM Comprehensive API endpoint testing (requires Docker to be running)

echo ==================================
echo 🧪 Testing API Endpoints
echo ==================================

echo.
echo This script tests:
echo   1. Code patterns (static analysis)
echo   2. Live API endpoints (requires backend running)
echo.

python verify_api_endpoints_comprehensive.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Tests failed!
    exit /b 1
)

echo.
echo ✅ All tests passed!
