/**
 * Error Message Utilities
 * Converts technical errors into user-friendly messages
 */

export interface ErrorDetails {
  title: string;
  description: string;
}

/**
 * Parse authentication errors (login/register)
 */
export function parseAuthError(error: any, context: 'login' | 'register' = 'login'): ErrorDetails {
  const status = error?.response?.status;
  const message = error?.response?.data?.detail || error?.response?.data?.message || error?.message || '';
  const lowerMessage = message.toLowerCase();

  // Login-specific errors
  if (context === 'login') {
    // Invalid credentials
    if (status === 401 || lowerMessage.includes('invalid credentials') || lowerMessage.includes('incorrect password') || lowerMessage.includes('wrong password')) {
      return {
        title: 'Invalid Credentials',
        description: 'The email or password you entered is incorrect. Please try again.',
      };
    }

    // Account not found
    if (status === 404 || lowerMessage.includes('not found') || lowerMessage.includes('no account') || lowerMessage.includes('user does not exist')) {
      return {
        title: 'Account Not Found',
        description: 'No account exists with this email address. Would you like to create one?',
      };
    }

    // Account locked/suspended
    if (status === 423 || lowerMessage.includes('locked') || lowerMessage.includes('suspended') || lowerMessage.includes('disabled')) {
      return {
        title: 'Account Locked',
        description: 'Your account has been temporarily locked. Please contact support for assistance.',
      };
    }
  }

  // Register-specific errors
  if (context === 'register') {
    // Email already exists
    if (status === 409 || lowerMessage.includes('already exists') || lowerMessage.includes('email taken') || lowerMessage.includes('already registered')) {
      return {
        title: 'Email Already Registered',
        description: 'An account with this email already exists. Try logging in instead.',
      };
    }

    // Invalid email format
    if (status === 422 || lowerMessage.includes('invalid email') || lowerMessage.includes('email format')) {
      return {
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
      };
    }

    // Weak password
    if (lowerMessage.includes('password') && (lowerMessage.includes('weak') || lowerMessage.includes('too short') || lowerMessage.includes('must contain'))) {
      return {
        title: 'Weak Password',
        description: 'Password must be at least 8 characters and include a special character.',
      };
    }
  }

  // Common errors for both
  // Rate limiting
  if (status === 429 || lowerMessage.includes('too many') || lowerMessage.includes('rate limit')) {
    return {
      title: 'Too Many Attempts',
      description: `Too many ${context} attempts. Please wait a few minutes and try again.`,
    };
  }

  // Server errors
  if (status && status >= 500) {
    return {
      title: 'Server Error',
      description: 'Our servers are experiencing issues. Please try again in a few moments.',
    };
  }

  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection') || status === 0) {
    return {
      title: 'Connection Error',
      description: 'Unable to connect to the server. Please check your internet connection.',
    };
  }

  // Timeout errors
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return {
      title: 'Request Timeout',
      description: 'The request took too long. Please try again.',
    };
  }

  // Fallback - use original message if available, otherwise generic
  return {
    title: context === 'login' ? 'Login Failed' : 'Registration Failed',
    description: message || `Unable to ${context === 'login' ? 'sign in' : 'create account'}. Please try again.`,
  };
}

/**
 * Parse upload errors (invoice/menu)
 */
export function parseUploadError(error: any): ErrorDetails {
  const status = error?.response?.status;
  const message = error?.response?.data?.detail || error?.response?.data?.message || error?.message || '';
  const lowerMessage = message.toLowerCase();

  // Usage limit exceeded
  if (status === 429 || lowerMessage.includes('usage limit') || lowerMessage.includes('limit exceeded')) {
    return {
      title: 'Usage Limit Reached',
      description: message || 'You\'ve reached your upload limit. Upgrade to continue uploading.',
    };
  }

  // File too large
  if (status === 413 || lowerMessage.includes('too large') || lowerMessage.includes('file size')) {
    return {
      title: 'File Too Large',
      description: 'Maximum file size is 10MB. Please upload a smaller file.',
    };
  }

  // Invalid file type
  if (status === 415 || lowerMessage.includes('invalid file') || lowerMessage.includes('unsupported')) {
    return {
      title: 'Invalid File Type',
      description: 'Please upload a PDF or image file (JPG, PNG).',
    };
  }

  // Processing failed
  if (lowerMessage.includes('processing') || lowerMessage.includes('parse') || lowerMessage.includes('extract')) {
    return {
      title: 'Processing Failed',
      description: message || 'Unable to process the file. Please try a different file or contact support.',
    };
  }

  // Server errors
  if (status && status >= 500) {
    return {
      title: 'Server Error',
      description: 'Unable to upload right now. Please try again in a few moments.',
    };
  }

  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || status === 0) {
    return {
      title: 'Connection Error',
      description: 'Upload failed due to connection issues. Please check your internet and try again.',
    };
  }

  // Fallback
  return {
    title: 'Upload Failed',
    description: message || 'Failed to upload file. Please try again.',
  };
}

/**
 * Parse general API errors
 */
export function parseAPIError(error: any, defaultTitle: string = 'Error'): ErrorDetails {
  const status = error?.response?.status;
  const message = error?.response?.data?.detail || error?.response?.data?.message || error?.message || '';
  const lowerMessage = message.toLowerCase();

  // Rate limiting
  if (status === 429) {
    return {
      title: 'Too Many Requests',
      description: 'You\'re making requests too quickly. Please slow down and try again.',
    };
  }

  // Unauthorized
  if (status === 401) {
    return {
      title: 'Authentication Required',
      description: 'Please log in to continue.',
    };
  }

  // Forbidden
  if (status === 403) {
    return {
      title: 'Access Denied',
      description: 'You don\'t have permission to perform this action.',
    };
  }

  // Not found
  if (status === 404) {
    return {
      title: 'Not Found',
      description: 'The requested resource was not found.',
    };
  }

  // Validation error
  if (status === 422) {
    return {
      title: 'Invalid Data',
      description: message || 'Please check your input and try again.',
    };
  }

  // Server errors
  if (status && status >= 500) {
    return {
      title: 'Server Error',
      description: 'Something went wrong on our end. Please try again later.',
    };
  }

  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || status === 0) {
    return {
      title: 'Connection Error',
      description: 'Unable to connect. Please check your internet connection.',
    };
  }

  // Fallback
  return {
    title: defaultTitle,
    description: message || 'An unexpected error occurred. Please try again.',
  };
}

/**
 * Get a simple error message string (for backwards compatibility)
 */
export function getErrorMessage(error: any): string {
  const details = parseAPIError(error);
  return `${details.title}: ${details.description}`;
}

/**
 * Parse data loading errors
 * @param error - The error object
 * @param dataType - What was being loaded (e.g., "invoices", "menu", "price alerts")
 */
export function parseDataLoadError(error: any, dataType: string): ErrorDetails {
  const status = error?.response?.status;
  const message = error?.response?.data?.detail || error?.response?.data?.message || error?.message || '';
  const lowerMessage = message.toLowerCase();

  // Network/connection errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection') || status === 0) {
    return {
      title: 'Connection Error',
      description: `Unable to load ${dataType}. Please check your internet connection and try again.`,
    };
  }

  // Authentication required
  if (status === 401) {
    return {
      title: 'Login Required',
      description: `Please log in to view ${dataType}.`,
    };
  }

  // Permission denied
  if (status === 403) {
    return {
      title: 'Access Denied',
      description: `You don't have permission to view this ${dataType}.`,
    };
  }

  // Not found
  if (status === 404) {
    const capitalizedType = dataType.charAt(0).toUpperCase() + dataType.slice(1);
    return {
      title: `${capitalizedType} Not Found`,
      description: `The ${dataType} you're looking for doesn't exist or has been deleted.`,
    };
  }

  // Server errors
  if (status && status >= 500) {
    return {
      title: 'Server Error',
      description: `Unable to load ${dataType} right now. Our servers are experiencing issues. Please try again in a moment.`,
    };
  }

  // Timeout
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return {
      title: 'Request Timeout',
      description: `Loading ${dataType} is taking too long. Please try again.`,
    };
  }

  // Fallback
  return {
    title: `Unable to Load ${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`,
    description: message || `Failed to load ${dataType}. Please try again or contact support if the problem persists.`,
  };
}

/**
 * Parse streaming/SSE errors
 * @param error - The error object
 * @param streamType - What's being streamed (e.g., "invoice processing", "menu analysis")
 */
export function parseStreamError(error: any, streamType: string): ErrorDetails {
  const message = error?.message || error?.toString() || '';
  const lowerMessage = message.toLowerCase();

  // Connection lost
  if (lowerMessage.includes('connection') || lowerMessage.includes('network')) {
    return {
      title: 'Connection Lost',
      description: `Lost connection during ${streamType}. Please check your internet and try again.`,
    };
  }

  // Aborted/cancelled
  if (lowerMessage.includes('abort') || lowerMessage.includes('cancel')) {
    return {
      title: 'Processing Cancelled',
      description: `${streamType.charAt(0).toUpperCase() + streamType.slice(1)} was cancelled.`,
    };
  }

  // Timeout
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return {
      title: 'Processing Timeout',
      description: `${streamType.charAt(0).toUpperCase() + streamType.slice(1)} is taking longer than expected. Please try again.`,
    };
  }

  // Parse error
  if (lowerMessage.includes('parse') || lowerMessage.includes('json') || lowerMessage.includes('syntax')) {
    return {
      title: 'Data Format Error',
      description: `Received invalid data during ${streamType}. Please try again.`,
    };
  }

  // Stream not available
  if (lowerMessage.includes('stream') || lowerMessage.includes('reader')) {
    return {
      title: 'Streaming Not Available',
      description: `Unable to start ${streamType}. Your browser may not support this feature.`,
    };
  }

  // Fallback
  return {
    title: 'Processing Failed',
    description: message || `${streamType.charAt(0).toUpperCase() + streamType.slice(1)} failed. Please try again.`,
  };
}

/**
 * Parse delete operation errors
 * @param error - The error object
 * @param itemType - What's being deleted (e.g., "invoice", "menu", "analysis")
 */
export function parseDeleteError(error: any, itemType: string): ErrorDetails {
  const status = error?.response?.status;
  const message = error?.response?.data?.detail || error?.response?.data?.message || error?.message || '';
  const lowerMessage = message.toLowerCase();

  // Conflict - item in use
  if (status === 409 || lowerMessage.includes('in use') || lowerMessage.includes('referenced') || lowerMessage.includes('linked')) {
    return {
      title: `Cannot Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`,
      description: message || `This ${itemType} is currently in use. Remove any links or references before deleting.`,
    };
  }

  // Permission denied
  if (status === 403) {
    return {
      title: 'Permission Denied',
      description: `You don't have permission to delete this ${itemType}.`,
    };
  }

  // Not found
  if (status === 404) {
    return {
      title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Not Found`,
      description: `The ${itemType} may have already been deleted or doesn't exist.`,
    };
  }

  // Server error
  if (status && status >= 500) {
    return {
      title: 'Server Error',
      description: `Unable to delete ${itemType} right now. Please try again in a moment.`,
    };
  }

  // Network error
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || status === 0) {
    return {
      title: 'Connection Error',
      description: `Delete failed due to connection issues. Please check your internet and try again.`,
    };
  }

  // Fallback
  return {
    title: 'Delete Failed',
    description: message || `Unable to delete ${itemType}. Please try again or contact support.`,
  };
}

/**
 * Parse save operation errors
 * @param error - The error object
 * @param itemType - What's being saved (e.g., "invoice", "menu", "recipe")
 */
export function parseSaveError(error: any, itemType: string): ErrorDetails {
  const status = error?.response?.status;
  const message = error?.response?.data?.detail || error?.response?.data?.message || error?.message || '';
  const lowerMessage = message.toLowerCase();

  // Duplicate
  if (status === 409 || lowerMessage.includes('duplicate') || lowerMessage.includes('already exists')) {
    return {
      title: 'Duplicate Entry',
      description: message || `A ${itemType} with this information already exists.`,
    };
  }

  // Validation error
  if (status === 422 || lowerMessage.includes('invalid') || lowerMessage.includes('validation')) {
    return {
      title: 'Invalid Data',
      description: message || `Please check your ${itemType} data and try again.`,
    };
  }

  // Payload too large
  if (status === 413 || lowerMessage.includes('too large') || lowerMessage.includes('size')) {
    return {
      title: 'Data Too Large',
      description: `The ${itemType} data is too large. Please reduce the size and try again.`,
    };
  }

  // Permission denied
  if (status === 403) {
    return {
      title: 'Permission Denied',
      description: `You don't have permission to save this ${itemType}.`,
    };
  }

  // Server error
  if (status && status >= 500) {
    return {
      title: 'Server Error',
      description: `Unable to save ${itemType} right now. Please try again in a moment.`,
    };
  }

  // Network error
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || status === 0) {
    return {
      title: 'Connection Error',
      description: `Save failed due to connection issues. Please check your internet and try again.`,
    };
  }

  // Fallback
  return {
    title: 'Save Failed',
    description: message || `Unable to save ${itemType}. Please try again.`,
  };
}

/**
 * Parse search operation errors
 * @param error - The error object
 * @param searchType - What's being searched (e.g., "inventory items", "competitors")
 */
export function parseSearchError(error: any, searchType: string = 'items'): ErrorDetails {
  const status = error?.response?.status;
  const message = error?.response?.data?.detail || error?.response?.data?.message || error?.message || '';
  const lowerMessage = message.toLowerCase();

  // Rate limiting
  if (status === 429) {
    return {
      title: 'Too Many Searches',
      description: 'You\'re searching too quickly. Please wait a moment and try again.',
    };
  }

  // Invalid query
  if (status === 422 || lowerMessage.includes('invalid query') || lowerMessage.includes('invalid search')) {
    return {
      title: 'Invalid Search',
      description: 'Please check your search terms and try again.',
    };
  }

  // Server error
  if (status && status >= 500) {
    return {
      title: 'Search Unavailable',
      description: `Unable to search ${searchType} right now. Please try again in a moment.`,
    };
  }

  // Network error
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || status === 0) {
    return {
      title: 'Connection Error',
      description: 'Search failed due to connection issues. Please check your internet.',
    };
  }

  // Fallback
  return {
    title: 'Search Failed',
    description: message || `Unable to search ${searchType}. Please try again.`,
  };
}
