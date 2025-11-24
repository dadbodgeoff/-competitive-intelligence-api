"""
Production-Safe Logging Configuration
Centralizes logging to prevent debug info leakage
"""
import os
import logging
from typing import Any

# Determine environment
IS_PRODUCTION = os.getenv('ENVIRONMENT', 'development') == 'production'
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO' if IS_PRODUCTION else 'DEBUG')

# Configure root logger
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def get_logger(name: str) -> logging.Logger:
    """Get a configured logger instance"""
    logger = logging.getLogger(name)
    
    # In production, suppress DEBUG and INFO for sensitive modules
    if IS_PRODUCTION:
        logger.setLevel(logging.WARNING)
    
    return logger

def safe_log_data(logger: logging.Logger, level: str, message: str, data: Any = None, mask_fields: list = None):
    """
    Safely log data with automatic masking of sensitive fields
    
    Args:
        logger: Logger instance
        level: Log level (debug, info, warning, error)
        message: Log message
        data: Data to log (will be masked in production)
        mask_fields: List of field names to mask
    """
    if mask_fields is None:
        mask_fields = ['password', 'token', 'api_key', 'secret', 'credit_card']
    
    log_func = getattr(logger, level.lower())
    
    if IS_PRODUCTION:
        # In production, don't log data details
        log_func(message)
    else:
        # In development, log full details
        if data:
            # Mask sensitive fields
            if isinstance(data, dict):
                masked_data = {
                    k: '***MASKED***' if any(field in k.lower() for field in mask_fields) else v
                    for k, v in data.items()
                }
                log_func(f"{message} | Data: {masked_data}")
            else:
                log_func(f"{message} | Data: {data}")
        else:
            log_func(message)

# Export convenience functions
def debug(message: str, **kwargs):
    """Log debug message (suppressed in production)"""
    if not IS_PRODUCTION:
        logging.debug(message, **kwargs)

def info(message: str, **kwargs):
    """Log info message"""
    logging.info(message, **kwargs)

def warning(message: str, **kwargs):
    """Log warning message"""
    logging.warning(message, **kwargs)

def error(message: str, **kwargs):
    """Log error message"""
    logging.error(message, **kwargs)
