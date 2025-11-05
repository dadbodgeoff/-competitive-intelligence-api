@echo off
echo ================================================================================
echo RESTARTING DOCKER AND TESTING MENU RECIPE FIX
echo ================================================================================
echo.

echo Step 1: Stopping all containers...
docker-compose -f docker-compose.dev.yml down
echo.

echo Step 2: Removing volumes (clearing caches)...
docker-compose -f docker-compose.dev.yml down -v
echo.

echo Step 3: Rebuilding containers (no cache)...
docker-compose -f docker-compose.dev.yml build --no-cache
echo.

echo Step 4: Starting containers in detached mode...
docker-compose -f docker-compose.dev.yml up -d
echo.

echo Step 5: Waiting for services to be ready (30 seconds)...
timeout /t 30 /nobreak
echo.

echo Step 6: Running test...
python test_menu_recipe_fix.py
echo.

echo ================================================================================
echo DONE!
echo ================================================================================
echo.
echo If the test passed, you can now test manually in the frontend:
echo   1. Go to http://localhost:5173
echo   2. Login as dadbodgeoff@gmail.com
echo   3. Navigate to Menu and select a menu item
echo   4. Click "Add Ingredient" and test the flow
echo.
pause
