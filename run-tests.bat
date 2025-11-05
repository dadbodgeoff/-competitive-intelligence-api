@echo off
REM Run all tests (component, unit, integration)

echo ==================================
echo 🧪 Running All Tests
echo ==================================

echo.
echo [1/3] Backend Unit Tests...
pytest tests/ -v --tb=short

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend tests failed!
    exit /b 1
)

echo.
echo [2/3] Frontend Component Tests...
cd frontend
call npm test -- --run

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend tests failed!
    cd ..
    exit /b 1
)

cd ..

echo.
echo [3/3] API Endpoint Tests...
python verify_api_endpoints.py

if %ERRORLEVEL% NEQ 0 (
    echo ❌ API tests failed!
    exit /b 1
)

echo.
echo ✅ All tests passed!
