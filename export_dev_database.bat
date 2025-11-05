@echo off
REM Export your complete dev database schema

echo.
echo ======================================================================
echo Export Dev Database Schema
echo ======================================================================
echo.

REM Check if pg_dump is installed
where pg_dump >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] pg_dump not found!
    echo.
    echo You need to install PostgreSQL tools:
    echo 1. Download from: https://www.postgresql.org/download/windows/
    echo 2. Install PostgreSQL (you only need command-line tools)
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] pg_dump found
echo.

REM Get password
echo Your connection string is:
echo postgresql://postgres:[YOUR_PASSWORD]@db.syxquxgynoinzwhwkosa.supabase.co:5432/postgres
echo.
set /p DB_PASSWORD="Enter your database password: "

if "%DB_PASSWORD%"=="" (
    echo [ERROR] Password cannot be empty
    pause
    exit /b 1
)

echo.
echo ======================================================================
echo Exporting Schema (this may take 1-2 minutes)...
echo ======================================================================
echo.

REM Export schema only (no data)
pg_dump --schema-only "postgresql://postgres:%DB_PASSWORD%@db.syxquxgynoinzwhwkosa.supabase.co:5432/postgres" > database\production_schema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo SUCCESS! Schema exported
    echo ======================================================================
    echo.
    echo File created: database\production_schema.sql
    echo.
    
    REM Show file size
    for %%A in (database\production_schema.sql) do (
        echo File size: %%~zA bytes
    )
    
    echo.
    echo Next steps:
    echo 1. Review the file: code database\production_schema.sql
    echo 2. Create your production Supabase project
    echo 3. Apply this schema to production
    echo.
    echo See COMPLETE_DATABASE_EXPORT_GUIDE.md for details.
    echo.
) else (
    echo.
    echo ======================================================================
    echo ERROR: Export failed
    echo ======================================================================
    echo.
    echo Common issues:
    echo - Wrong password (check Supabase dashboard)
    echo - Network/firewall blocking connection
    echo - Database not accessible
    echo.
    echo Try:
    echo 1. Verify password in Supabase Settings -^> Database
    echo 2. Check you're not behind a firewall
    echo 3. Try the pooler connection string instead
    echo.
)

pause
