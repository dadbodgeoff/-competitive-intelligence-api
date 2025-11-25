# Multi-stage build for production
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# .env.production is already in the frontend folder with Supabase credentials
# No need to overwrite it with .env.docker

# Build frontend with explicit production mode
RUN NODE_ENV=production npm run build

# Python build stage (for packages that need compilation)
# Use bookworm (stable) instead of trixie (testing) for faster mirrors
FROM python:3.11-slim-bookworm AS python-builder

WORKDIR /build

# Use faster mirrors and install build dependencies
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    sed -i 's|http://deb.debian.org|http://cloudfront.debian.net|g' /etc/apt/sources.list.d/debian.sources && \
    apt-get update && apt-get install -y \
    gcc \
    g++

# Install Python packages with wheels and pip cache
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install -r requirements.txt

# Python runtime stage
# Use bookworm (stable) instead of trixie (testing) for faster mirrors
FROM python:3.11-slim-bookworm

WORKDIR /app

# Use faster mirrors and install runtime dependencies
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    sed -i 's|http://deb.debian.org|http://cloudfront.debian.net|g' /etc/apt/sources.list.d/debian.sources && \
    apt-get update && apt-get install -y \
    curl

# Copy installed packages from builder
COPY --from=python-builder /install /usr/local

# Copy backend code
COPY api/ ./api/
COPY services/ ./services/
COPY config/ ./config/
COPY prompts/ ./prompts/
COPY database/ ./database/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create non-root user for security
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run with uvicorn (no reload in production)
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
