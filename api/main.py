from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import os
import time
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,  # Changed from DEBUG to reduce noise
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Install PII filter for production logging (redacts emails, IPs, etc.)
from services.logging_filter import setup_pii_filter
setup_pii_filter()

# Initialize FastAPI app
app = FastAPI(
    title="Competitive Intelligence API",
    version="1.0.0",
    description="Restaurant competitor analysis platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# ============================================================================
# SECURITY: Global Exception Handlers - Prevent Information Leakage
# ============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch-all exception handler to prevent stack traces from leaking to users.
    
    Security Best Practice:
    - Production: Return generic error message
    - Development: Return detailed error for debugging
    """
    # Log the full error with stack trace for debugging
    logger.error(
        f"Unhandled exception on {request.method} {request.url.path}",
        exc_info=True,
        extra={
            "path": request.url.path,
            "method": request.method,
            "client_host": request.client.host if request.client else "unknown"
        }
    )
    
    # Determine environment
    environment = os.getenv("ENVIRONMENT", "development").lower()
    
    if environment == "production":
        # PRODUCTION: Never expose internal errors
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An internal error occurred. Please try again later.",
                "error_id": f"{int(time.time())}"  # For support reference
            }
        )
    else:
        # DEVELOPMENT: Show details for debugging
        return JSONResponse(
            status_code=500,
            content={
                "detail": str(exc),
                "type": type(exc).__name__,
                "path": request.url.path
            }
        )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handle HTTP exceptions (4xx, 5xx) with sanitized messages.
    """
    # Log HTTP errors
    if exc.status_code >= 500:
        logger.error(f"HTTP {exc.status_code} on {request.url.path}: {exc.detail}")
    else:
        logger.warning(f"HTTP {exc.status_code} on {request.url.path}: {exc.detail}")
    
    # Return the exception as-is (these are already safe)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle request validation errors (422) with clear messages.
    """
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    
    # Return validation errors (safe to expose)
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": exc.errors()
        }
    )

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"🔵 Incoming request: {request.method} {request.url.path}")
    # Sanitize headers - remove Authorization token
    safe_headers = {k: v for k, v in request.headers.items() if k.lower() != 'authorization'}
    logger.debug(f"   Headers: {safe_headers}")
    
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(f"✅ Request completed in {process_time:.2f}ms - Status: {response.status_code}")
        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"❌ Request failed after {process_time:.2f}ms - Error: {str(e)}")
        raise

# ============================================================================
# SECURITY: CORS Configuration
# ============================================================================
# IMPORTANT: Update ALLOWED_ORIGINS in .env.production with your actual domain
# Format: https://yourdomain.com,https://www.yourdomain.com
# Never use "*" in production as it allows any origin to access your API

environment = os.getenv("ENVIRONMENT", "development").lower()
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "")

if environment == "production":
    # PRODUCTION: Strict origin validation
    if not allowed_origins_str or "yourdomain.com" in allowed_origins_str:
        logger.error(
            "⚠️  SECURITY WARNING: ALLOWED_ORIGINS not configured for production! "
            "Update .env.production with your actual domain(s)."
        )
        # Fail-safe: Don't allow any origins if not configured
        allowed_origins = []
    else:
        allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]
        logger.info(f"🔒 CORS configured for production domains: {allowed_origins}")
else:
    # DEVELOPMENT: Allow localhost for testing
    if allowed_origins_str:
        allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]
    else:
        allowed_origins = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ]
    logger.info(f"🔓 CORS configured for development: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],  # Explicit methods
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],  # Explicit headers
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Security headers middleware (CSP, X-Frame-Options, etc.)
from api.middleware.security_headers import SecurityHeadersMiddleware
app.add_middleware(SecurityHeadersMiddleware)

# Include routes
from api.routes.auth import router as auth_router
from api.routes.accounts import router as accounts_router
from api.routes.tier_analysis import router as analysis_router
from api.routes.streaming_analysis import router as streaming_router
from api.routes.subscription import router as subscription_router
from api.routes.usage_limits import router as usage_limits_router
# New modular invoice routes
from api.routes.invoices import upload, parsing, management, processing
# Menu management routes
from api.routes.menu import upload as menu_upload, parsing as menu_parsing, management as menu_management, recipes as menu_recipes, sales as menu_sales
from api.routes.menu_comparison import router as menu_comparison_router
from api.routes.ordering import router as ordering_router
from api.routes.prep import router as prep_router
from api.routes.scheduling import router as scheduling_router
# from api.routes.inventory_operations import router as inventory_router  # REMOVED: Frontend inventory module removed
from api.routes.user_preferences import router as preferences_router
from api.routes.price_analytics import router as price_analytics_router
from api.routes.alert_management import router as alert_management_router
from api.routes.dashboard_analytics import router as dashboard_analytics_router
from api.routes.competitive_intelligence_summary import router as competitive_intelligence_router
from api.routes.invoice_analytics import router as invoice_analytics_router
from api.routes import csp_report
from api.routes.nano_banana import router as nano_banana_router
from api.routes.nano_banana_demo import router as nano_banana_demo_router

# Billing module
from api.routes.billing import router as billing_router

# DISABLED: Inventory processing removed - invoices are source of truth only
# Initialize background workers (registers event handlers)
# import workers.invoice_processor_worker
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(accounts_router, tags=["Accounts"])
app.include_router(analysis_router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(streaming_router, prefix="/api/v1/streaming", tags=["Streaming Analysis"])
app.include_router(subscription_router, prefix="/api/v1/subscription", tags=["Subscription"])
app.include_router(usage_limits_router, tags=["Usage Limits"])
# Invoice operations (modular)
app.include_router(upload.router, tags=["Invoice Operations"])
app.include_router(parsing.router, tags=["Invoice Operations"])
app.include_router(management.router, tags=["Invoice Operations"])
app.include_router(processing.router, tags=["Invoice Operations"])
# app.include_router(inventory_router, tags=["Inventory Operations"])  # REMOVED: Frontend inventory module removed
app.include_router(preferences_router, tags=["User Preferences"])
app.include_router(price_analytics_router, tags=["Price Analytics"])
app.include_router(alert_management_router, tags=["Alert Management"])
app.include_router(dashboard_analytics_router, tags=["Dashboard Analytics"])
app.include_router(invoice_analytics_router, tags=["Invoice Analytics"])
app.include_router(competitive_intelligence_router, tags=["Competitive Intelligence"])
# Menu operations (modular)
app.include_router(menu_upload.router, tags=["Menu Operations"])
app.include_router(menu_parsing.router, tags=["Menu Operations"])
app.include_router(menu_management.router, tags=["Menu Operations"])
app.include_router(menu_recipes.router, tags=["Menu Operations"])
app.include_router(menu_sales.router, tags=["Menu Sales"])
app.include_router(menu_comparison_router, tags=["Menu Comparison"])
app.include_router(ordering_router, tags=["Ordering"])
app.include_router(scheduling_router)
app.include_router(prep_router)
app.include_router(nano_banana_router, tags=["Nano Banana"])
app.include_router(nano_banana_demo_router, tags=["Nano Banana Demo"])
# Billing routes
app.include_router(billing_router, prefix="/api/v1", tags=["Billing"])
app.include_router(csp_report.router, tags=["Security"])

# Health check endpoint (used by Docker healthcheck)
@app.get("/health")
async def health_check():
    """Simple health check for Docker/load balancers"""
    from supabase import create_client
    
    health = {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": time.time(),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "checks": {}
    }
    
    # Check database connectivity
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if supabase_url and supabase_key:
            client = create_client(supabase_url, supabase_key)
            client.table("users").select("id").limit(1).execute()
            health["checks"]["database"] = "ok"
        else:
            health["checks"]["database"] = "not_configured"
    except Exception as e:
        health["checks"]["database"] = "error"
        health["status"] = "degraded"
        logger.error(f"Database health check failed: {e}")
    
    # Check Redis (optional)
    try:
        from services.redis_client import redis_client
        redis_client.ping()
        health["checks"]["redis"] = "ok"
    except:
        health["checks"]["redis"] = "unavailable"
    
    return health

# Detailed health check with dependencies
@app.get("/api/v1/health")
async def detailed_health_check():
    """Detailed health check with all dependencies"""
    from services.malware_scanner import MalwareScannerService
    from supabase import create_client
    
    health = {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": time.time(),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "checks": {}
    }
    
    # Database
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        client = create_client(supabase_url, supabase_key)
        client.table("users").select("id").limit(1).execute()
        health["checks"]["database"] = "ok"
    except Exception as e:
        health["checks"]["database"] = f"error: {str(e)}"
        health["status"] = "degraded"
    
    # Redis
    try:
        from services.redis_client import redis_client
        redis_client.ping()
        health["checks"]["redis"] = "ok"
    except Exception as e:
        health["checks"]["redis"] = f"unavailable: {str(e)}"
    
    # ClamAV
    try:
        scanner = MalwareScannerService()
        clamav_status = scanner.get_status()
        health["checks"]["clamav"] = clamav_status
    except Exception as e:
        health["checks"]["clamav"] = f"error: {str(e)}"
    
    return health

# ============================================================================
# PRODUCTION: Static File Serving for Frontend
# ============================================================================
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Serve frontend static files in production
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists() and os.getenv("ENVIRONMENT") == "production":
    logger.info(f"📦 Serving frontend from {frontend_dist}")
    logger.info(f"📦 Frontend dist exists: {frontend_dist.exists()}")
    logger.info(f"📦 Frontend dist contents: {list(frontend_dist.iterdir()) if frontend_dist.exists() else 'N/A'}")
    
    # Serve static assets (JS, CSS, images)
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
        logger.info(f"✅ Mounted /assets from {assets_dir}")
    
    # Serve legal documents (PDFs for Terms/Privacy)
    legal_dir = frontend_dist / "legal"
    if legal_dir.exists():
        app.mount("/legal", StaticFiles(directory=str(legal_dir)), name="legal")
        logger.info(f"📄 Mounted /legal from {legal_dir}")
    
    # Serve example images - IMPORTANT: Mount before catch-all route
    examples_dir = frontend_dist / "examples"
    if examples_dir.exists():
        app.mount("/examples", StaticFiles(directory=str(examples_dir)), name="examples")
        logger.info(f"🖼️ Mounted /examples from {examples_dir}")
        logger.info(f"🖼️ Examples contents: {list(examples_dir.iterdir())}")
    else:
        logger.warning(f"⚠️ Examples directory not found at {examples_dir}")
    
    # Serve placeholder images
    placeholders_dir = frontend_dist / "placeholders"
    if placeholders_dir.exists():
        app.mount("/placeholders", StaticFiles(directory=str(placeholders_dir)), name="placeholders")
        logger.info(f"🖼️ Mounted /placeholders from {placeholders_dir}")
    
    # IMPORTANT: Catch-all route MUST be registered LAST
    # This serves index.html for all other routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve React SPA for all non-API routes"""
        # Don't intercept API routes, health checks, or static file paths
        if full_path.startswith(("api/", "assets/", "examples/", "placeholders/", "legal/")) or full_path == "health":
            raise HTTPException(status_code=404)
        
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return HTMLResponse(content=index_file.read_text())
        raise HTTPException(status_code=404)
else:
    # Development mode - API only
    @app.get("/")
    async def root():
        return {"message": "Competitive Intelligence API", "status": "running", "mode": "development"}

# Email confirmation endpoint
@app.get("/auth/confirm")
async def confirm_email():
    """Simple confirmation page for email verification"""
    with open("confirmation_page.html", "r") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=200)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host=os.getenv("APP_HOST", "localhost"),
        port=int(os.getenv("APP_PORT", 8000)),
        reload=True
    )
