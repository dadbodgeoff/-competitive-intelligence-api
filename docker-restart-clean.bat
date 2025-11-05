@echo off
echo ========================================
echo FULL DOCKER CLEAN RESTART
echo ========================================
echo.

echo [1/4] Stopping all containers...
docker-compose -f docker-compose.dev.yml down

echo.
echo [2/4] Removing volumes and clearing cache...
docker-compose -f docker-compose.dev.yml down -v

echo.
echo [3/4] Rebuilding without cache...
docker-compose -f docker-compose.dev.yml build --no-cache

echo.
echo [4/4] Starting fresh containers...
docker-compose -f docker-compose.dev.yml up

echo.
echo ========================================
echo DONE!
echo ========================================
