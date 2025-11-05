import os
from typing import List

# Load environment variables (only in non-Docker environments)
# Docker containers get env vars from docker-compose
try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass  # In Docker, env vars are already set

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://syxquxgynoinzwhwkosa.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-this-in-production-2024")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Cookie Security Configuration
COOKIE_SECURE = os.getenv("ENV") == "production" or os.getenv("APP_ENV") == "production"

# Application Configuration
APP_ENV = os.getenv("APP_ENV", "development")
APP_PORT = int(os.getenv("APP_PORT", 8000))
APP_HOST = os.getenv("APP_HOST", "localhost")

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
