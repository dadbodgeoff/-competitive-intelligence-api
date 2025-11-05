# Quick Start Guide

## Start Docker with API Verification

### Windows:
```bash
docker-start.bat
```

### Linux/Mac:
```bash
chmod +x docker-start.sh
./docker-start.sh
```

## What Happens:
1. ✅ Verifies all 38 API endpoints
2. ✅ Checks 8 modules are production-ready
3. ✅ Starts Docker only if verification passes
4. ❌ Stops and shows errors if issues found

## Manual Commands

### Just verify (don't start Docker):
```bash
python verify_api_endpoints.py
```

### Start Docker without verification:
```bash
docker-compose -f docker-compose.dev.yml up
```

### Stop Docker:
```bash
docker-compose -f docker-compose.dev.yml down
```

## Your Current Setup

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **Redis**: localhost:6379

## Files You Need

- ✅ `docker-start.bat` - Windows startup (with verification)
- ✅ `docker-start.sh` - Linux/Mac startup (with verification)
- ✅ `verify_api_endpoints.py` - Verification script
- ✅ `docker-compose.dev.yml` - Dev configuration
- ✅ `docker-compose.yml` - Production configuration

## That's It!

Run `docker-start.bat` and you're good to go. The script will verify everything is correct before starting.
