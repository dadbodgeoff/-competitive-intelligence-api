# Docker Commands

## Daily Workflow

```bash
# Morning: Start Docker (with API verification)
docker-start.bat

# After changes: Run all tests
run-tests.bat

# Evening: Stop Docker
docker-compose -f docker-compose.dev.yml down
```

## Fresh Start (Clear Cache)

```bash
# Stop everything
docker-compose -f docker-compose.dev.yml down

# Clear all caches and rebuild
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up

# Or use the startup script after clearing
docker-start.bat
```

## Quick Commands

```bash
# Start
docker-start.bat

# Run all tests (backend + frontend + API)
run-tests.bat

# Test API endpoints only
docker-test-endpoints.bat

# Stop
docker-compose -f docker-compose.dev.yml down

# Restart
docker-compose -f docker-compose.dev.yml restart

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Clear everything and start fresh
docker-compose -f docker-compose.dev.yml down -v && docker-start.bat
```
