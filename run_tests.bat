@echo off
REM Quick script to run E2E auth tests on Windows

echo 🔒 Running E2E Auth Test Suite...
echo.

REM Check if dependencies are installed
python -c "import pytest" 2>nul
if errorlevel 1 (
    echo 📦 Installing dependencies...
    pip install -r tests\e2e_auth\requirements.txt
    playwright install
)

REM Run tests
python tests\e2e_auth\test_runner.py

REM Show report location
echo.
echo 📊 View HTML report: tests\e2e_auth\reports\report.html
pause
