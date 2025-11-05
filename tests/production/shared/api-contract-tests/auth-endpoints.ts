/**
 * API Contract Tests - Authentication Endpoints
 * 
 * These contracts define the expected request/response structure for auth endpoints.
 * Both backend and frontend tests should validate against these contracts.
 */

export const AUTH_CONTRACTS = {
  register: {
    method: 'POST',
    path: '/api/v1/auth/register',
    request: {
      email: 'string (required, valid email format)',
      password: 'string (required, min 8 chars, must contain uppercase, lowercase, number, special char)',
      first_name: 'string (optional)',
      last_name: 'string (optional)'
    },
    response: {
      user: {
        id: 'uuid',
        email: 'string',
        subscription_tier: 'free|premium|enterprise',
        first_name: 'string?',
        last_name: 'string?',
        created_at: 'ISO 8601 datetime'
      }
    },
    cookies: {
      access_token: {
        httpOnly: true,
        secure: true, // production only
        sameSite: 'lax',
        maxAge: 86400 // 24 hours
      },
      refresh_token: {
        httpOnly: true,
        secure: true, // production only
        sameSite: 'lax',
        maxAge: 604800 // 7 days
      }
    },
    status_codes: {
      success: 200,
      validation_error: 422,
      duplicate_email: 400,
      server_error: 500
    },
    error_format: {
      detail: {
        error: 'string (user-friendly message)',
        code: 'string (error code)'
      }
    }
  },

  login: {
    method: 'POST',
    path: '/api/v1/auth/login',
    request: {
      email: 'string (required)',
      password: 'string (required)'
    },
    response: {
      user: {
        id: 'uuid',
        email: 'string',
        subscription_tier: 'free|premium|enterprise',
        first_name: 'string?',
        last_name: 'string?'
      }
    },
    cookies: {
      access_token: 'same as register',
      refresh_token: 'same as register'
    },
    status_codes: {
      success: 200,
      invalid_credentials: 401,
      validation_error: 422,
      server_error: 500
    }
  },

  refresh: {
    method: 'POST',
    path: '/api/v1/auth/refresh',
    request: {
      // No body, uses refresh_token cookie
    },
    response: {
      message: 'string'
    },
    cookies: {
      access_token: 'new access token (same format as register)'
    },
    status_codes: {
      success: 200,
      invalid_token: 401,
      expired_token: 401,
      server_error: 500
    }
  },

  logout: {
    method: 'POST',
    path: '/api/v1/auth/logout',
    request: {
      // No body
    },
    response: {
      message: 'string'
    },
    cookies: {
      access_token: 'cleared (maxAge=0)',
      refresh_token: 'cleared (maxAge=0)'
    },
    status_codes: {
      success: 200,
      server_error: 500
    }
  },

  me: {
    method: 'GET',
    path: '/api/v1/auth/me',
    request: {
      // No body, uses access_token cookie
    },
    response: {
      user: {
        id: 'uuid',
        email: 'string',
        subscription_tier: 'free|premium|enterprise',
        first_name: 'string?',
        last_name: 'string?',
        created_at: 'ISO 8601 datetime'
      }
    },
    status_codes: {
      success: 200,
      unauthorized: 401,
      server_error: 500
    }
  }
};

/**
 * Password validation rules
 */
export const PASSWORD_RULES = {
  min_length: 8,
  max_length: 128,
  requires_uppercase: true,
  requires_lowercase: true,
  requires_number: true,
  requires_special_char: true,
  special_chars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Email validation rules
 */
export const EMAIL_RULES = {
  max_length: 255,
  format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

/**
 * JWT token structure
 */
export const JWT_TOKEN_STRUCTURE = {
  header: {
    alg: 'HS256',
    typ: 'JWT'
  },
  payload: {
    sub: 'uuid (user_id)',
    exp: 'unix timestamp (24h from issue)',
    iat: 'unix timestamp (issue time)'
  }
};
