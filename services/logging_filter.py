"""
PII Logging Filter
Redacts sensitive data from log messages in production.
"""
import logging
import os
import re
from typing import Optional


class PIIFilter(logging.Filter):
    """
    Filter that redacts PII (emails, IPs, etc.) from log records in production.
    
    In development, logs are unchanged for debugging.
    In production, sensitive data is masked.
    """
    
    # Patterns to redact
    EMAIL_PATTERN = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
    IP_PATTERN = re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')
    # UUID pattern (for user IDs in some contexts)
    UUID_PATTERN = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', re.IGNORECASE)
    
    def __init__(self, name: str = ''):
        super().__init__(name)
        self.is_production = os.getenv("ENVIRONMENT", "development").lower() == "production"
        self.redact_uuids = os.getenv("REDACT_USER_IDS", "false").lower() == "true"
    
    def filter(self, record: logging.LogRecord) -> bool:
        """
        Filter log record, redacting PII in production.
        Always returns True (allows the log), but modifies the message.
        """
        if not self.is_production:
            return True  # Don't redact in development
        
        # Redact the message
        if hasattr(record, 'msg') and isinstance(record.msg, str):
            record.msg = self._redact_pii(record.msg)
        
        # Redact args if they're strings
        if record.args:
            if isinstance(record.args, dict):
                record.args = {k: self._redact_pii(str(v)) if isinstance(v, str) else v 
                              for k, v in record.args.items()}
            elif isinstance(record.args, tuple):
                record.args = tuple(
                    self._redact_pii(str(arg)) if isinstance(arg, str) else arg 
                    for arg in record.args
                )
        
        return True
    
    def _redact_pii(self, text: str) -> str:
        """Redact PII from text."""
        # Redact emails: user@example.com -> u***@e***.com
        text = self.EMAIL_PATTERN.sub(self._mask_email, text)
        
        # Redact IPs: 192.168.1.1 -> ***.***.***.***
        text = self.IP_PATTERN.sub('***.***.***.***', text)
        
        # Optionally redact UUIDs (disabled by default as they're often needed for debugging)
        if self.redact_uuids:
            text = self.UUID_PATTERN.sub('********-****-****-****-************', text)
        
        return text
    
    def _mask_email(self, match: re.Match) -> str:
        """Mask email while keeping some structure for debugging."""
        email = match.group(0)
        try:
            local, domain = email.split('@')
            domain_parts = domain.split('.')
            
            # Keep first char of local part and domain
            masked_local = local[0] + '***' if local else '***'
            masked_domain = domain_parts[0][0] + '***' if domain_parts[0] else '***'
            tld = domain_parts[-1] if len(domain_parts) > 1 else 'com'
            
            return f"{masked_local}@{masked_domain}.{tld}"
        except:
            return "***@***.***"


def setup_pii_filter():
    """
    Add PII filter to all loggers.
    Call this once at application startup.
    """
    pii_filter = PIIFilter()
    
    # Add to root logger
    root_logger = logging.getLogger()
    root_logger.addFilter(pii_filter)
    
    # Also add to common loggers
    for logger_name in ['api', 'services', 'uvicorn', 'uvicorn.access']:
        logger = logging.getLogger(logger_name)
        logger.addFilter(pii_filter)
    
    logging.getLogger(__name__).info("PII filter installed for production logging")


def mask_email(email: Optional[str]) -> str:
    """
    Utility function to manually mask an email for logging.
    Use this when you need to log something with an email.
    
    Example:
        logger.info(f"Processing request for {mask_email(user.email)}")
    """
    if not email:
        return "***"
    
    try:
        local, domain = email.split('@')
        return f"{local[0]}***@{domain[0]}***.{domain.split('.')[-1]}"
    except:
        return "***@***.***"
