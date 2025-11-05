@echo off
REM Helper script to export your complete database schema

echo.
echo ======================================================================
echo Export Complete Database Schema
echo ======================================================================
echo.
echo You have 3 options to export your dev database:
echo.
echo [1] pg_dump (Recommended - Most Complete)
echo     - Exports everything: tables, functions, triggers, RLS policies
echo     - Requires PostgreSQL tools installed
echo.
echo [2] Supabase CLI (Best for ongoing development)
echo     - Creates proper migration files
echo     - Requires Node.js and Supabase CLI
echo.
echo [3] Manual Export (No installation required)
echo     - Use Supabase Dashboard
echo     - Copy/paste approach
echo.
set /p CHOICE="Choose option (1, 2, or 3): "

if "%CHOICE%"=="1" goto PGDUMP
if "%CHOICE%"=="2" goto SUPABASE_CLI
if "%CHOICE%"=="3" goto MANUAL
goto END

:PGDUMP
echo.
echo ======================================================================
echo Option 1: Using pg_dump
echo ======================================================================
echo.
echo Step 1: Get your database connection string
echo -----------------------------------------
echo 1. Go to: https://app.supabase.com/project/syxquxgynoinzwhwkosa
echo 2. Click Settings (gear icon) -^> Database
echo 3. Scroll to "Connection string"
echo 4. Copy the URI format
echo.
echo It looks like:
echo postgresql://postgres:[YOUR-PASSWORD]@db.syxquxgynoinzwhwkosa.supabase.co:5432/postgres
echo.
pause
echo.
echo Step 2: Run pg_dump
echo -----------------------------------------
echo.
echo Copy this command and replace [YOUR-PASSWORD] with your actual password:
echo.
echo pg_dump --schema-only "postgresql://postgres:[YOUR-PASSWORD]@db.syxquxgynoinzwhwkosa.supabase.co:5432/postgres" ^> database\production_schema.sql
echo.
echo This will create: database\production_schema.sql
echo.
echo If you don't have pg_dump installed:
echo - Download PostgreSQL from: https://www.postgresql.org/download/windows/
echo - Or use Option 2 (Supabase CLI) instead
echo.
pause
goto END

:SUPABASE_CLI
echo.
echo ======================================================================
echo Option 2: Using Supabase CLI
echo ======================================================================
echo.
echo Step 1: Install Supabase CLI
echo -----------------------------------------
echo npm install -g supabase
echo.
set /p INSTALL="Press Enter after installing (or Ctrl+C to cancel)..."
echo.
echo Step 2: Login to Supabase
echo -----------------------------------------
echo supabase login
echo.
echo This will open your browser to authenticate.
echo.
pause
echo.
echo Step 3: Link to your project
echo -----------------------------------------
echo supabase link --project-ref syxquxgynoinzwhwkosa
echo.
pause
echo.
echo Step 4: Pull the schema
echo -----------------------------------------
echo supabase db pull
echo.
echo This creates migration files in supabase/migrations/
echo.
pause
goto END

:MANUAL
echo.
echo ======================================================================
echo Option 3: Manual Export via Dashboard
echo ======================================================================
echo.
echo Step 1: Open Supabase Dashboard
echo -----------------------------------------
echo Go to: https://app.supabase.com/project/syxquxgynoinzwhwkosa
echo.
pause
echo.
echo Step 2: Open SQL Editor
echo -----------------------------------------
echo Click "SQL Editor" in the left sidebar
echo Click "New query"
echo.
pause
echo.
echo Step 3: Get Table List
echo -----------------------------------------
echo Paste this query and click Run:
echo.
echo SELECT table_name FROM information_schema.tables 
echo WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
echo ORDER BY table_name;
echo.
echo This shows all your tables.
echo.
pause
echo.
echo Step 4: Export Schema
echo -----------------------------------------
echo Unfortunately, Supabase Dashboard doesn't have a one-click export.
echo.
echo RECOMMENDED: Use Option 1 (pg_dump) instead for complete export.
echo.
echo Or manually copy each table definition from the Table Editor.
echo.
pause
goto END

:END
echo.
echo ======================================================================
echo Next Steps
echo ======================================================================
echo.
echo After exporting your schema:
echo.
echo 1. Review the exported file(s)
echo 2. Create your production Supabase project
echo 3. Apply the schema to production:
echo    - Open production SQL Editor
echo    - Copy/paste the schema file
echo    - Click Run
echo.
echo 4. Verify tables exist in production Table Editor
echo.
echo See GET_COMPLETE_DATABASE.md for detailed instructions.
echo.
pause
