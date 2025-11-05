/**
 * Test Data Fixtures
 * 
 * Centralized test data for consistent testing across all journeys
 */

export interface TestUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
}

/**
 * Test users for different subscription tiers
 * These should match the users in shared/test-data/users.json
 */
export const TEST_USERS: Record<string, TestUser> = {
  free: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'free@test.com',
    password: 'Test123!@#',
    firstName: 'Free',
    lastName: 'User',
    subscriptionTier: 'free',
  },
  premium: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'premium@test.com',
    password: 'Test123!@#',
    firstName: 'Premium',
    lastName: 'User',
    subscriptionTier: 'premium',
  },
  enterprise: {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'enterprise@test.com',
    password: 'Test123!@#',
    firstName: 'Enterprise',
    lastName: 'User',
    subscriptionTier: 'enterprise',
  },
};

/**
 * Test file paths
 * These files should exist in shared/test-data/sample-files/
 */
export const TEST_FILES = {
  invoice: {
    small: '../../shared/test-data/sample-files/sample_invoice_5_items.pdf',
    medium: '../../shared/test-data/sample-files/sample_invoice_20_items.pdf',
    large: '../../shared/test-data/sample-files/sample_invoice_50_items.pdf',
    invalid: '../../shared/test-data/sample-files/invalid_file.txt',
  },
  menu: {
    small: '../../shared/test-data/sample-files/sample_menu_10_items.pdf',
    medium: '../../shared/test-data/sample-files/sample_menu_30_items.pdf',
    invalid: '../../shared/test-data/sample-files/invalid_menu.txt',
  },
};

/**
 * Mock API responses for consistent testing
 */
export const MOCK_RESPONSES = {
  auth: {
    user: {
      id: '123',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      subscription_tier: 'free',
      created_at: '2023-01-01T00:00:00Z',
    },
    loginSuccess: {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      token_type: 'bearer',
    },
  },
  
  invoice: {
    uploadSuccess: {
      file_url: 'https://storage.example.com/invoices/test-invoice.pdf',
      file_name: 'test-invoice.pdf',
    },
    parsedItems: [
      {
        id: '1',
        description: 'Mozzarella Cheese',
        quantity: 10,
        unit: 'lb',
        unit_price: 5.99,
        extended_price: 59.90,
      },
      {
        id: '2',
        description: 'Pizza Sauce',
        quantity: 5,
        unit: 'gal',
        unit_price: 12.50,
        extended_price: 62.50,
      },
    ],
  },
  
  menu: {
    uploadSuccess: {
      file_url: 'https://storage.example.com/menus/test-menu.pdf',
      file_name: 'test-menu.pdf',
    },
    parsedItems: [
      {
        id: '1',
        name: 'Margherita Pizza',
        category: 'Pizzas',
        price: 12.99,
        description: 'Fresh mozzarella, tomato sauce, basil',
      },
      {
        id: '2',
        name: 'Caesar Salad',
        category: 'Appetizers',
        price: 8.99,
        description: 'Romaine lettuce, parmesan, croutons',
      },
    ],
  },
  
  analysis: {
    startSuccess: {
      analysis_id: 'test-analysis-123',
      status: 'pending',
      message: 'Analysis started successfully',
    },
    completed: {
      analysis_id: 'test-analysis-123',
      restaurant_name: 'Test Pizza',
      location: 'New York, NY',
      category: 'pizza',
      tier: 'free',
      status: 'completed',
      competitors: [
        {
          name: 'Competitor Pizza',
          rating: 4.5,
          review_count: 150,
          distance_miles: 0.3,
          place_id: 'place-123',
          address: '123 Main St, New York, NY',
        },
      ],
      insights: [
        {
          title: 'Price Competition',
          description: 'Competitor offers lower prices',
          confidence: 'high',
          type: 'threat',
          proof_quote: 'Great pizza at affordable prices',
          mention_count: 5,
          competitor_name: 'Competitor Pizza',
        },
      ],
      processing_time_seconds: 45,
      created_at: '2023-01-01T00:00:00Z',
      completed_at: '2023-01-01T00:01:00Z',
    },
  },
  
  comparison: {
    competitors: [
      {
        id: '1',
        name: 'Competitor 1',
        rating: 4.5,
        review_count: 200,
        distance_miles: 0.5,
        address: '123 Main St',
      },
      {
        id: '2',
        name: 'Competitor 2',
        rating: 4.3,
        review_count: 150,
        distance_miles: 0.8,
        address: '456 Oak Ave',
      },
      {
        id: '3',
        name: 'Competitor 3',
        rating: 4.7,
        review_count: 300,
        distance_miles: 1.2,
        address: '789 Pine Rd',
      },
    ],
  },
};

/**
 * Test form data
 */
export const TEST_FORM_DATA = {
  analysis: {
    valid: {
      restaurant_name: 'Test Pizza Restaurant',
      location: 'New York, NY',
      category: 'pizza',
      tier: 'free' as const,
    },
    invalid: {
      restaurant_name: '',
      location: '',
    },
  },
  
  comparison: {
    valid: {
      restaurant_name: 'Test Pizza',
      location: 'New York, NY',
      category: 'pizza',
      radius_miles: 3,
    },
  },
  
  registration: {
    valid: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'newuser@example.com',
      password: 'SecurePass123!',
    },
  },
};

/**
 * Expected validation error messages
 */
export const VALIDATION_ERRORS = {
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address',
  },
  password: {
    required: 'Password is required',
    tooShort: 'Password must be at least 8 characters',
    weak: 'Password must contain uppercase, lowercase, and numbers',
  },
  restaurantName: {
    required: 'Restaurant name is required',
  },
  location: {
    required: 'Location is required',
  },
};

/**
 * API endpoints for reference
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    me: '/api/v1/auth/me',
    logout: '/api/v1/auth/logout',
  },
  invoice: {
    upload: '/api/invoices/upload',
    parseStream: '/api/invoices/parse-stream',
    save: '/api/invoices/save',
    list: '/api/invoices/',
    detail: '/api/invoices/:id',
  },
  menu: {
    upload: '/api/menu/upload',
    parseStream: '/api/menu/parse-stream',
    save: '/api/menu/save',
    current: '/api/menu/current',
    recipe: '/api/menu/items/:id/recipe',
  },
  analysis: {
    run: '/api/v1/analysis/run',
    stream: '/api/v1/analysis/:id/stream',
    status: '/api/v1/analysis/:id/status',
    results: '/api/v1/analysis/:id',
    saved: '/api/v1/analysis/saved',
  },
  comparison: {
    discover: '/api/menu-comparison/discover',
    select: '/api/menu-comparison/select',
    status: '/api/menu-comparison/:id/status',
    results: '/api/menu-comparison/:id/results',
    saved: '/api/menu-comparison/saved',
  },
};

/**
 * Timeout values (in milliseconds)
 */
export const TIMEOUTS = {
  short: 3000,      // 3 seconds - for quick operations
  medium: 10000,    // 10 seconds - for API calls
  long: 30000,      // 30 seconds - for slow operations
  streaming: 60000, // 60 seconds - for streaming operations
};

/**
 * Generate unique test data
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}@example.com`;
}

export function generateUniqueRestaurantName(prefix: string = 'Test Restaurant'): string {
  const timestamp = Date.now();
  return `${prefix} ${timestamp}`;
}
