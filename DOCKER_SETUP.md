# Docker Setup Guide

## Quick Start

### Development
```bash
# Start dev environment with hot reload
docker-compose -f docker-compose.dev.yml up

# Or use the helper script
chmod +x docker-dev.sh
./docker-dev.sh
```

Access:
- Backend API: http://localhost:8000
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/api/docs

### Production

1. **Create production environment file:**
```bash
cp .env.production.example .env.production
# Edit .env.production with your actual values
```

2. **Deploy:**
```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

Or manually:
```bash
docker-compose -f docker-compose.yml up -d --build
```

## Architecture

### Production Build
- **Multi-stage build**: Frontend built separately, then copied into backend image
- **Single container**: Serves both API and static frontend
- **Optimized**: Only production dependencies, no dev tools
- **Secure**: Runs as non-root user

### Development Build
- **Hot reload**: Code changes reflect immediately
- **Separate containers**: Backend and frontend run independently
- **Volume mounts**: Source code mounted for live editing
- **Full tooling**: Includes dev dependencies and debugging tools

## Commands

### Development
```bash
# Start
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f api

# Stop
docker-compose -f docker-compose.dev.yml down

# Rebuild
docker-compose -f docker-compose.dev.yml up --build
```

### Production
```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down

# Restart
docker-compose restart api

# Check health
curl http://localhost:8000/health
```

### Maintenance
```bash
# Remove all containers and volumes
docker-compose down -v

# Clean up unused images
docker system prune -a

# View resource usage
docker stats
```

## Environment Variables

### Required for Production
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Service role key
- `SUPABASE_JWT_SECRET` - JWT secret for auth
- `GEMINI_API_KEY` - Google Gemini API key
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `OUTSCRAPER_API_KEY` - Outscraper API key

### Optional
- `REDIS_HOST` - Redis host (default: redis)
- `REDIS_PORT` - Redis port (default: 6379)
- `LOG_LEVEL` - Logging level (default: INFO)
- `ALLOWED_ORIGINS` - CORS origins

## Deployment Platforms

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render
1. Connect your GitHub repo
2. Select "Docker" as environment
3. Set environment variables in dashboard
4. Deploy

### DigitalOcean App Platform
1. Connect GitHub repo
2. Select Dockerfile
3. Configure environment variables
4. Deploy

### AWS ECS/Fargate
```bash
# Build and tag
docker build -t your-app:latest .

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker tag your-app:latest your-account.dkr.ecr.us-east-1.amazonaws.com/your-app:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/your-app:latest
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs api

# Check if port is in use
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Mac/Linux
```

### Frontend not loading
- Check if frontend was built: `docker-compose logs api | grep "frontend"`
- Verify CORS settings in `api/main.py`

### Database connection issues
- Verify Supabase credentials in `.env.production`
- Check network connectivity: `docker-compose exec api ping supabase.co`

### Redis connection issues
```bash
# Test Redis
docker-compose exec redis redis-cli ping
```

## Performance Tips

1. **Use BuildKit** for faster builds:
```bash
export DOCKER_BUILDKIT=1
```

2. **Layer caching**: Dependencies are cached separately from code

3. **Multi-stage builds**: Frontend built once, not on every backend change

4. **Health checks**: Automatic restart if container becomes unhealthy

## Security Checklist

- [ ] Use `.env.production` for secrets (never commit)
- [ ] Run as non-root user (already configured)
- [ ] Set `COOKIE_SECURE=true` in production
- [ ] Configure proper CORS origins
- [ ] Use secrets management (AWS Secrets Manager, etc.)
- [ ] Enable HTTPS (handled by platform/reverse proxy)
- [ ] Regular security updates: `docker-compose pull && docker-compose up -d`

## Next Steps

1. Set up CI/CD pipeline (GitHub Actions example below)
2. Configure monitoring (Sentry, DataDog, etc.)
3. Set up log aggregation
4. Configure auto-scaling
5. Set up database backups

## GitHub Actions CI/CD Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker image
        run: |
          docker build -t your-registry/your-app:latest .
          docker push your-registry/your-app:latest
      
      - name: Deploy to server
        run: |
          # SSH into server and pull new image
          ssh user@your-server "cd /app && docker-compose pull && docker-compose up -d"
```
