import os
import logging
from typing import List

logger = logging.getLogger(__name__)

# Load environment variables (only in non-Docker environments)
# Docker containers get env vars from docker-compose
try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass  # In Docker, env vars are already set

# Application Configuration
APP_ENV = os.getenv("APP_ENV", "development")
APP_PORT = int(os.getenv("APP_PORT", 8000))
APP_HOST = os.getenv("APP_HOST", "localhost")
IS_PRODUCTION = APP_ENV == "production" or os.getenv("ENVIRONMENT") == "production"

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Validate required Supabase config
if not SUPABASE_URL:
    if IS_PRODUCTION:
        raise ValueError("SUPABASE_URL must be set in production")
    else:
        # Development fallback (your dev Supabase instance)
        SUPABASE_URL = "https://syxquxgynoinzwhwkosa.supabase.co"
        logger.warning("⚠️ Using default SUPABASE_URL - set env var for production")

# JWT Configuration - NO DEFAULTS IN PRODUCTION
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

# Validate JWT secret
if not JWT_SECRET_KEY:
    if IS_PRODUCTION:
        raise ValueError("JWT_SECRET_KEY must be set in production - refusing to start with insecure default")
    else:
        # Development only - generate a random key for local testing
        import secrets
        JWT_SECRET_KEY = secrets.token_urlsafe(64)
        logger.warning("⚠️ Using random JWT_SECRET_KEY for development - sessions won't persist across restarts")

# Cookie Security Configuration
COOKIE_SECURE = IS_PRODUCTION

# CORS Configuration
CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

# Rate Limiting Configuration
RATE_LIMIT_FREE_TIER = int(os.getenv("RATE_LIMIT_FREE_TIER", 10))
RATE_LIMIT_PRO_TIER = int(os.getenv("RATE_LIMIT_PRO_TIER", 100))
RATE_LIMIT_WINDOW_MINUTES = int(os.getenv("RATE_LIMIT_WINDOW_MINUTES", 60))

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost:5432/competitive_intel")

# External API Keys (add when needed)
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
