"""
Error Sanitization Utility
Prevents information leakage through error messages
"""
import logging
import os
from typing import Optional
from fastapi import HTTPException
from pydantic import ValidationError

logger = logging.getLogger(__name__)


class ErrorSanitizer:
    """
    Sanitizes error messages to prevent information leakage.
    
    Security Best Practices:
    - Never expose internal errors in production
    - Log full details server-side
    - Return generic messages to users
    - Only expose safe, user-actionable errors
    """
    
    @staticmethod
    def is_production() -> bool:
        """Check if running in production environment"""
        return os.getenv("ENVIRONMENT", "development").lower() == "production"
    
    @staticmethod
    def sanitize_error(
        e: Exception,
        user_message: str = "Operation failed",
        log_context: Optional[dict] = None
    ) -> str:
        """
        Sanitize error message for user display.
        
        Args:
            e: The exception that occurred
            user_message: Generic message to show users
            log_context: Additional context for logging
            
        Returns:
            Safe error message for users
        """
        # Log full error details server-side
        log_extra = log_context or {}
        logger.error(
            f"Error occurred: {type(e).__name__}: {str(e)}",
            exc_info=True,
            extra=log_extra
        )
        
        # In development, show more details
        if not ErrorSanitizer.is_production():
            return f"{user_message}: {str(e)}"
        
        # In production, only expose safe errors
        
        # Validation errors are safe to expose
        if isinstance(e, ValidationError):
            return f"Validation error: {str(e)}"
        
        # HTTPException with safe detail
        if isinstance(e, HTTPException):
            # Only expose if it's a client error (4xx)
            if 400 <= e.status_code < 500:
                return e.detail
            # Server errors (5xx) get generic message
            return user_message
        
        # Known safe error types
        safe_error_types = [
            "ValueError",  # Only if explicitly raised with safe message
            "KeyError",    # Only if explicitly raised with safe message
        ]
        
        # For known safe types, check if message looks safe
        if type(e).__name__ in safe_error_types:
            error_str = str(e).lower()
            # Check for sensitive patterns
            sensitive_patterns = [
                "password", "secret", "key", "token", "credential",
                "postgresql://", "mysql://", "mongodb://",
                "localhost", "127.0.0.1", "internal",
                "traceback", "exception", "error at"
            ]
            
            if not any(pattern in error_str for pattern in sensitive_patterns):
                return str(e)
        
        # Default: return generic message
        return user_message
    
    @staticmethod
    def create_http_exception(
        e: Exception,
        status_code: int = 500,
        user_message: str = "Operation failed",
        log_context: Optional[dict] = None
    ) -> HTTPException:
        """
        Create HTTPException with sanitized error message.
        
        Args:
            e: The original exception
            status_code: HTTP status code to return
            user_message: Generic message for users
            log_context: Additional context for logging
            
        Returns:
            HTTPException with safe error message
        """
        safe_message = ErrorSanitizer.sanitize_error(e, user_message, log_context)
        return HTTPException(status_code=status_code, detail=safe_message)


# Convenience functions for common use cases

def sanitize_database_error(e: Exception) -> str:
    """Sanitize database-related errors"""
    return ErrorSanitizer.sanitize_error(
        e,
        user_message="Database operation failed. Please try again.",
        log_context={"error_type": "database"}
    )


def sanitize_api_error(e: Exception, service_name: str = "external service") -> str:
    """Sanitize external API errors"""
    return ErrorSanitizer.sanitize_error(
        e,
        user_message=f"Failed to communicate with {service_name}. Please try again.",
        log_context={"error_type": "external_api", "service": service_name}
    )


def sanitize_file_error(e: Exception) -> str:
    """Sanitize file operation errors"""
    return ErrorSanitizer.sanitize_error(
        e,
        user_message="File operation failed. Please check the file and try again.",
        log_context={"error_type": "file_operation"}
    )


def sanitize_parsing_error(e: Exception) -> str:
    """Sanitize parsing/processing errors"""
    return ErrorSanitizer.sanitize_error(
        e,
        user_message="Failed to process the document. Please verify the format and try again.",
        log_context={"error_type": "parsing"}
    )


def sanitize_auth_error(e: Exception) -> str:
    """Sanitize authentication errors"""
    return ErrorSanitizer.sanitize_error(
        e,
        user_message="Authentication failed. Please check your credentials.",
        log_context={"error_type": "authentication"}
    )


# Example usage:
"""
from services.error_sanitizer import ErrorSanitizer, sanitize_database_error

try:
    # Database operation
    result = db.query(...)
except Exception as e:
    # Option 1: Raise HTTPException directly
    raise ErrorSanitizer.create_http_exception(
        e,
        status_code=500,
        user_message="Failed to fetch data"
    )
    
    # Option 2: Use convenience function
    raise HTTPException(
        status_code=500,
        detail=sanitize_database_error(e)
    )
"""
