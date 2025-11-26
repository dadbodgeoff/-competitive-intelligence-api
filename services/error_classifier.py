"""
Shared Error Classification Utility
Centralizes error type classification for consistent user-friendly messaging
"""


def classify_invoice_error(error: Exception) -> str:
    """
    Classify invoice processing error type for user-friendly messaging
    
    Args:
        error: The exception that occurred
        
    Returns:
        Error type string: 'zero_quantity', 'pack_size_conversion', 
        'data_validation', 'rate_limited', 'timeout', 'invalid_file',
        'file_not_found', or 'unknown'
    """
    error_str = str(error).lower()
    
    # Invoice processing errors
    if 'check_quantity_nonzero' in error_str:
        return "zero_quantity"
    elif 'unit conversion' in error_str or 'pack_size' in error_str:
        return "pack_size_conversion"
    elif 'constraint' in error_str:
        return "data_validation"
    
    # API/Network errors
    elif "rate" in error_str or "429" in error_str:
        return "rate_limited"
    elif "timeout" in error_str:
        return "timeout"
    elif "invalid" in error_str or "corrupt" in error_str:
        return "invalid_file"
    elif "not found" in error_str or "404" in error_str:
        return "file_not_found"
    
    return "unknown"


def get_user_friendly_message(error_type: str, error: Exception = None) -> str:
    """
    Get user-friendly error message based on error type
    
    Args:
        error_type: Classified error type from classify_invoice_error
        error: Optional original exception for fallback message
        
    Returns:
        User-friendly error message string
    """
    messages = {
        "zero_quantity": "Item quantity was zero. Please check the invoice and try again.",
        "pack_size_conversion": "Could not convert pack size. Please verify the pack size format.",
        "data_validation": "Data validation failed. Please check the item details.",
        "rate_limited": "System is busy right now. Please try again in a moment.",
        "timeout": "Processing took too long. Please try again or contact support.",
        "invalid_file": "This file doesn't appear to be a valid invoice. Please check and try again.",
        "file_not_found": "File not found. Please upload again.",
        "unknown": "Something went wrong. Our team has been notified."
    }
    
    return messages.get(error_type, f"Error: {str(error)}" if error else "An unexpected error occurred.")
