@echo off
REM Production Setup Helper Script for Windows
REM This script guides you through setting up production environment

echo.
echo ======================================================================
echo Production Environment Setup
echo ======================================================================
echo.

REM Check if .env.production exists
if exist .env.production (
    echo [WARNING] .env.production already exists!
    echo.
    set /p OVERWRITE="Do you want to overwrite it? (y/N): "
    if /i not "%OVERWRITE%"=="y" (
        echo Keeping existing .env.production
        goto VERIFY
    )
)

REM Copy template
echo [1/4] Creating .env.production from template...
copy .env.production.example .env.production >nul
echo       Done!
echo.

REM Generate JWT secret
echo [2/4] Generating JWT secret...
python generate_jwt_secret.py
echo.
echo       Copy the generated secret above and paste it into .env.production
echo       as the value for JWT_SECRET_KEY
echo.
pause

REM Remind about Supabase
echo [3/4] Supabase Setup Required
echo.
echo       You need to:
echo       1. Create a NEW Supabase project at https://supabase.com/dashboard
echo       2. Copy the URL, anon key, and service_role key
echo       3. Paste them into .env.production
echo.
echo       Press any key when you've updated .env.production with Supabase credentials...
pause >nul
echo.

REM Remind about API keys
echo [4/4] API Keys Setup
echo.
echo       Update these API keys in .env.production:
echo       - GOOGLE_GEMINI_API_KEY
echo       - GOOGLE_PLACES_API_KEY
echo       - SERPAPI_KEY
echo       - OUTSCRAPER_API_KEY
echo.
echo       Press any key when you've updated all API keys...
pause >nul
echo.

:VERIFY
REM Verify setup
echo ======================================================================
echo Verifying Production Setup
echo ======================================================================
echo.
python verify_production_setup.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo SUCCESS! Production environment is ready.
    echo ======================================================================
    echo.
    echo Next steps:
    echo   1. Run database migrations: python run_menu_migrations.py
    echo   2. Deploy your application
    echo   3. Run smoke tests
    echo.
    echo See PRODUCTION_CHECKLIST.md for detailed deployment steps.
    echo.
) else (
    echo.
    echo ======================================================================
    echo ERRORS FOUND - Fix them before deploying!
    echo ======================================================================
    echo.
    echo Edit .env.production and run this script again.
    echo.
)

pause
