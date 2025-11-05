@echo off
echo ========================================
echo Restarting Docker with Clean Build
echo ========================================
echo.

echo Step 1: Stopping all containers...
docker-compose -f docker-compose.dev.yml down
echo.

echo Step 2: Removing volumes...
docker-compose -f docker-compose.dev.yml down -v
echo.

echo Step 3: Building with no cache (this may take a few minutes)...
docker-compose -f docker-compose.dev.yml build --no-cache
echo.

echo Step 4: Starting containers...
docker-compose -f docker-compose.dev.yml up
