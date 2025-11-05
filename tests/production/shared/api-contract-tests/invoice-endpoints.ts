/**
 * API Contract Tests - Invoice Processing Endpoints
 * 
 * These contracts define the expected request/response structure for invoice endpoints.
 */

export const INVOICE_CONTRACTS = {
  upload: {
    method: 'POST',
    path: '/api/v1/invoices/upload',
    request: {
      file: 'multipart/form-data (PDF, max 10MB)',
      vendor_hint: 'string (optional, helps with parsing)'
    },
    response: {
      file_url: 'string (Supabase storage URL)',
      file_id: 'uuid',
      file_name: 'string',
      file_size: 'number (bytes)'
    },
    status_codes: {
      success: 200,
      file_too_large: 413,
      invalid_file_type: 400,
      unauthorized: 401,
      server_error: 500
    }
  },

  parse_stream: {
    method: 'GET',
    path: '/api/v1/invoices/parse-stream',
    query_params: {
      file_url: 'string (required)',
      vendor_hint: 'string (optional)'
    },
    response_type: 'text/event-stream (SSE)',
    events: {
      parsing_started: {
        data: {
          message: 'string',
          timestamp: 'ISO 8601 datetime'
        }
      },
      parsing_progress: {
        data: {
          progress: 'number (0-100)',
          stage: 'string (extracting_text|analyzing|validating)',
          message: 'string'
        }
      },
      parsed_data: {
        data: {
          vendor_name: 'string',
          invoice_number: 'string',
          invoice_date: 'YYYY-MM-DD',
          total_amount: 'number',
          line_items: [
            {
              item_name: 'string',
              quantity: 'number',
              unit: 'string',
              unit_price: 'number',
              extended_price: 'number',
              pack_size: 'string (optional)',
              category: 'string (optional)'
            }
          ]
        }
      },
      validation_complete: {
        data: {
          validated_items: 'number',
          fuzzy_matches: 'number',
          new_items: 'number',
          unit_conversions: 'number'
        }
      },
      error: {
        data: {
          error: 'string',
          code: 'string'
        }
      }
    },
    status_codes: {
      success: 200,
      unauthorized: 401,
      rate_limited: 429,
      server_error: 500
    }
  },

  save: {
    method: 'POST',
    path: '/api/v1/invoices/save',
    request: {
      file_url: 'string',
      invoice_data: {
        vendor_name: 'string (required)',
        invoice_number: 'string (required)',
        invoice_date: 'YYYY-MM-DD (required)',
        total_amount: 'number (required)',
        line_items: [
          {
            item_name: 'string (required)',
            quantity: 'number (required)',
            unit: 'string (required)',
            unit_price: 'number (required)',
            extended_price: 'number (required)',
            pack_size: 'string (optional)',
            category: 'string (optional)',
            inventory_item_id: 'uuid (optional, for fuzzy matches)'
          }
        ]
      }
    },
    response: {
      invoice_id: 'uuid',
      items_created: 'number',
      inventory_items_created: 'number',
      inventory_items_updated: 'number'
    },
    status_codes: {
      success: 200,
      validation_error: 422,
      unauthorized: 401,
      duplicate: 409,
      server_error: 500
    }
  },

  list: {
    method: 'GET',
    path: '/api/v1/invoices/list',
    query_params: {
      page: 'number (default: 1)',
      limit: 'number (default: 20, max: 100)',
      vendor: 'string (optional filter)',
      status: 'string (optional filter: processed|pending|error)',
      start_date: 'YYYY-MM-DD (optional filter)',
      end_date: 'YYYY-MM-DD (optional filter)'
    },
    response: {
      invoices: [
        {
          id: 'uuid',
          vendor_name: 'string',
          invoice_number: 'string',
          invoice_date: 'YYYY-MM-DD',
          total_amount: 'number',
          status: 'processed|pending|error',
          item_count: 'number',
          created_at: 'ISO 8601 datetime'
        }
      ],
      pagination: {
        page: 'number',
        limit: 'number',
        total: 'number',
        total_pages: 'number'
      }
    },
    status_codes: {
      success: 200,
      unauthorized: 401,
      server_error: 500
    }
  },

  detail: {
    method: 'GET',
    path: '/api/v1/invoices/{invoice_id}',
    response: {
      invoice: {
        id: 'uuid',
        vendor_name: 'string',
        invoice_number: 'string',
        invoice_date: 'YYYY-MM-DD',
        total_amount: 'number',
        status: 'string',
        file_url: 'string',
        created_at: 'ISO 8601 datetime'
      },
      line_items: [
        {
          id: 'uuid',
          item_name: 'string',
          quantity: 'number',
          unit: 'string',
          unit_price: 'number',
          extended_price: 'number',
          pack_size: 'string?',
          category: 'string?',
          inventory_item_id: 'uuid?'
        }
      ]
    },
    status_codes: {
      success: 200,
      not_found: 404,
      forbidden: 403,
      unauthorized: 401,
      server_error: 500
    }
  },

  delete: {
    method: 'DELETE',
    path: '/api/v1/invoices/{invoice_id}',
    response: {
      message: 'string',
      deleted_items: 'number',
      deleted_inventory_items: 'number'
    },
    status_codes: {
      success: 200,
      not_found: 404,
      forbidden: 403,
      unauthorized: 401,
      server_error: 500
    }
  }
};

/**
 * File upload constraints
 */
export const FILE_CONSTRAINTS = {
  max_size_bytes: 10485760, // 10MB
  allowed_types: ['application/pdf'],
  allowed_extensions: ['.pdf']
};

/**
 * Rate limits (per tier)
 */
export const RATE_LIMITS = {
  free: {
    concurrent: 2,
    hourly: 10,
    daily: 20
  },
  premium: {
    concurrent: 5,
    hourly: 50,
    daily: 200
  },
  enterprise: {
    concurrent: -1, // unlimited
    hourly: -1,
    daily: -1
  }
};

/**
 * Fuzzy matching thresholds
 */
export const FUZZY_MATCHING = {
  auto_match_threshold: 0.85,
  review_threshold: 0.70,
  create_new_threshold: 0.70
};
