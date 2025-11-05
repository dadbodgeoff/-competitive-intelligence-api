@echo off
REM Docker startup script with API verification for Windows

echo ==================================
echo 🚀 Starting Docker Containers
echo ==================================

REM Step 1: Verify API endpoints (code patterns only, backend not running yet)
echo.
echo 📋 Step 1: Verifying API endpoint patterns...
python verify_api_endpoints.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ API verification failed!
    echo Fix the issues above before starting Docker.
    exit /b 1
)

echo.
echo ✅ API verification passed!

REM Step 2: Start Docker containers
echo.
echo 📋 Step 2: Starting Docker containers...
docker-compose -f docker-compose.dev.yml up --build

echo.
echo ✅ Docker containers started successfully!
