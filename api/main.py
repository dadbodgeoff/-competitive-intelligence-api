from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import os
import time
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Competitive Intelligence API",
    version="1.0.0",
    description="Restaurant competitor analysis platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"🔵 Incoming request: {request.method} {request.url.path}")
    logger.debug(f"   Headers: {dict(request.headers)}")
    
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(f"✅ Request completed in {process_time:.2f}ms - Status: {response.status_code}")
        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"❌ Request failed after {process_time:.2f}ms - Error: {str(e)}")
        raise

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
from api.routes.auth import router as auth_router
from api.routes.analysis import router as legacy_analysis_router
from api.routes.tier_analysis import router as analysis_router
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(analysis_router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(legacy_analysis_router, prefix="/api/v1/legacy/analysis", tags=["Legacy Analysis"])

# Health check endpoint
@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": os.getenv("APP_ENV", "development")
    }

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Competitive Intelligence API", "status": "running"}

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
