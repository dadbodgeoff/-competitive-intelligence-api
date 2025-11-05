# Docker Quick Start

## Development (Right Now)

```bash
# 1. Make sure you have .env file with your credentials
cp .env.example .env
# Edit .env with your API keys

# 2. Start dev environment
docker-compose -f docker-compose.dev.yml up

# That's it! Access:
# - Backend: http://localhost:8000
# - Frontend: http://localhost:5173
# - API Docs: http://localhost:8000/api/docs
```

## Production (When Ready to Deploy)

```bash
# 1. Create production environment file
cp .env.production.example .env.production
# Edit .env.production with production credentials

# 2. Deploy
chmod +x docker-deploy.sh
./docker-deploy.sh

# Access at http://localhost:8000
```

## Common Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop everything
docker-compose -f docker-compose.dev.yml down

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build

# Clean slate (removes volumes)
docker-compose -f docker-compose.dev.yml down -v
```

## What This Gives You

### Development Mode
- ✅ Hot reload on code changes
- ✅ Separate frontend/backend containers
- ✅ Redis included
- ✅ All your current dev workflow

### Production Mode
- ✅ Single optimized container
- ✅ Frontend built and bundled
- ✅ Runs as non-root user
- ✅ Health checks
- ✅ Auto-restart on failure
- ✅ Ready for Railway, Render, AWS, etc.

## Deployment Platforms

### Railway (Easiest)
1. Push to GitHub
2. Connect Railway to your repo
3. Add environment variables in Railway dashboard
4. Railway auto-detects Dockerfile and deploys

### Render
1. Connect GitHub repo
2. Select "Docker" environment
3. Add environment variables
4. Deploy

### DigitalOcean
1. Create App Platform app
2. Connect GitHub
3. Select Dockerfile
4. Add environment variables
5. Deploy

## Troubleshooting

**Port already in use?**
```bash
# Stop your current dev servers first
# Then run Docker
```

**Changes not showing?**
```bash
# Rebuild
docker-compose -f docker-compose.dev.yml up --build
```

**Need to see what's happening?**
```bash
# Follow logs
docker-compose -f docker-compose.dev.yml logs -f api
```

## When to Use Docker

**Use Docker when:**
- Deploying to production
- Want consistent environment across team
- Deploying to cloud platforms
- Need easy Redis setup

**Stick with current setup when:**
- Actively developing (unless you prefer Docker)
- Running tests
- Debugging with breakpoints

Both work! Docker is just another option.
