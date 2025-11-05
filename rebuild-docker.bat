@echo off
REM Full Docker Rebuild Script
REM Stops containers, clears caches, rebuilds from scratch

echo ========================================
echo FULL DOCKER REBUILD
echo ========================================
echo.

echo [1/4] Stopping all containers...
docker-compose -f docker-compose.dev.yml down
echo.

echo [2/4] Removing volumes (clearing caches)...
docker-compose -f docker-compose.dev.yml down -v
echo.

echo [3/4] Building images (no cache)...
docker-compose -f docker-compose.dev.yml build --no-cache
echo.

echo [4/4] Starting containers...
docker-compose -f docker-compose.dev.yml up

echo.
echo ========================================
echo REBUILD COMPLETE
echo ========================================
