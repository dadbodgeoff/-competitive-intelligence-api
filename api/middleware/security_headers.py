"""
Security Headers Middleware
Adds CSP and other security headers to all responses
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import os
import logging

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all HTTP responses
    
    Headers added:
    - Content-Security-Policy (CSP)
    - X-Frame-Options
    - X-Content-Type-Options
    - Referrer-Policy
    - Permissions-Policy
    """
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Get environment
        environment = os.getenv("ENVIRONMENT", "development").lower()
        
        # Skip CSP in development for easier debugging
        if environment == "development":
            logger.debug("Skipping CSP in development environment")
            return response
        
        # Add basic security headers (always)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Add HSTS in production (forces HTTPS)
        if environment == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Build CSP policy
        csp_policy = self._build_csp_policy()
        
        # Add CSP header (report-only or enforcing)
        csp_report_only = os.getenv("CSP_REPORT_ONLY", "true").lower() == "true"
        
        if csp_report_only:
            response.headers["Content-Security-Policy-Report-Only"] = csp_policy
            logger.debug("CSP enabled in report-only mode")
        else:
            response.headers["Content-Security-Policy"] = csp_policy
            logger.info("CSP enabled in enforcement mode")
        
        return response
    
    def _build_csp_policy(self) -> str:
        """
        Build Content Security Policy based on environment configuration
        """
        # Get environment-specific URLs
        api_url = os.getenv("VITE_API_URL", "")
        supabase_url = os.getenv("SUPABASE_URL", "")
        sentry_dsn = os.getenv("VITE_SENTRY_DSN", "")
        posthog_host = os.getenv("VITE_POSTHOG_HOST", "")
        
        # Base policy (strict)
        csp_directives = {
            "default-src": ["'self'"],
            "script-src": ["'self'"],
            "style-src": ["'self'"],
            "img-src": ["'self'", "data:", "blob:"],
            "font-src": ["'self'"],
            "connect-src": ["'self'"],
            "frame-ancestors": ["'none'"],
            "base-uri": ["'self'"],
            "form-action": ["'self'"],
            "object-src": ["'none'"],
        }
        
        # Add Google Fonts (if not self-hosting)
        use_google_fonts = os.getenv("USE_GOOGLE_FONTS", "true").lower() == "true"
        if use_google_fonts:
            csp_directives["style-src"].append("https://fonts.googleapis.com")
            csp_directives["font-src"].append("https://fonts.gstatic.com")
        
        # Add Supabase Storage for images
        if supabase_url:
            csp_directives["img-src"].append(supabase_url)
            csp_directives["connect-src"].append(supabase_url)
        
        # Add API URL
        if api_url and api_url != "'self'":
            csp_directives["connect-src"].append(api_url)
        
        # Add Sentry (if configured)
        if sentry_dsn:
            try:
                # Extract domain from Sentry DSN: https://xxx@xxx.ingest.sentry.io/xxx
                if "@" in sentry_dsn:
                    sentry_domain = sentry_dsn.split("@")[1].split("/")[0]
                    csp_directives["connect-src"].append(f"https://{sentry_domain}")
            except Exception as e:
                logger.warning(f"Could not parse Sentry DSN for CSP: {e}")
        
        # Add PostHog (if configured)
        if posthog_host:
            csp_directives["connect-src"].append(posthog_host)
        
        # Add CSP violation reporting
        report_uri = os.getenv("CSP_REPORT_URI", "/api/csp-report")
        if report_uri:
            csp_directives["report-uri"] = [report_uri]
        
        # Add upgrade-insecure-requests in production
        if os.getenv("ENVIRONMENT", "").lower() == "production":
            csp_directives["upgrade-insecure-requests"] = []
        
        # Build policy string
        policy_parts = []
        for directive, sources in csp_directives.items():
            if sources:
                policy_parts.append(f"{directive} {' '.join(sources)}")
            else:
                policy_parts.append(directive)
        
        return "; ".join(policy_parts)
