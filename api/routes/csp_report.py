"""
CSP Violation Reporting Endpoint
Receives and logs Content Security Policy violations
"""
from fastapi import APIRouter, Request
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/api/csp-report")
async def csp_violation_report(request: Request):
    """
    Receive and log CSP violation reports
    
    CSP violations are sent by the browser when a policy is violated.
    This endpoint logs them for monitoring and debugging.
    """
    try:
        # Parse CSP report
        report = await request.json()
        csp_report = report.get("csp-report", {})
        
        # Extract key information
        violated_directive = csp_report.get("violated-directive", "unknown")
        blocked_uri = csp_report.get("blocked-uri", "unknown")
        document_uri = csp_report.get("document-uri", "unknown")
        source_file = csp_report.get("source-file", "unknown")
        line_number = csp_report.get("line-number", "unknown")
        
        # Log violation
        logger.warning(
            f"CSP Violation: {violated_directive} blocked {blocked_uri} "
            f"on {document_uri} (source: {source_file}:{line_number})"
        )
        
        # Optionally send to Sentry or other monitoring service
        # import sentry_sdk
        # sentry_sdk.capture_message(
        #     f"CSP Violation: {violated_directive}",
        #     level="warning",
        #     extra=csp_report
        # )
        
        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"Error processing CSP report: {e}")
        return {"status": "error", "message": str(e)}
