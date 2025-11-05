import { Page } from '@playwright/test';

/**
 * Authentication Helper Utilities
 * 
 * Provides reusable functions for login, logout, and auth state management
 */

export interface TestUser {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  subscriptionTier?: 'free' | 'premium' | 'enterprise';
}

/**
 * Login via UI (form submission)
 * Use this for testing the login flow itself
 */
export async function loginViaUI(
  page: Page,
  email: string = 'test@example.com',
  password: string = 'Test123!@#'
): Promise<void> {
  await page.goto('/login');
  
  // Fill login form
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  
  // Submit
  await page.click('[data-testid="login-button"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

/**
 * Login via API (faster, for test setup)
 * Use this when you need to be logged in but aren't testing the login flow
 */
export async function loginViaAPI(
  page: Page,
  user: TestUser
): Promise<void> {
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:8000';
  
  // Make login request
  const response = await page.request.post(`${apiUrl}/api/v1/auth/login`, {
    data: {
      email: user.email,
      password: user.password,
    },
  });
  
  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
  }
  
  // Cookies are automatically set by the browser context
  // Navigate to dashboard to verify login
  await page.goto('/dashboard');
  await page.waitForURL('/dashboard');
}

/**
 * Logout via UI
 */
export async function logout(page: Page): Promise<void> {
  // Click user menu
  await page.click('[data-testid="user-menu"]');
  
  // Click logout
  await page.click('text=Logout');
  
  // Should redirect to landing page
  await page.waitForURL('/', { timeout: 5000 });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto('/dashboard');
    await page.waitForURL('/dashboard', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Mock authentication for isolated component testing
 * Use this when you want to test a protected page without going through login
 */
export async function mockAuthState(
  page: Page,
  user: Partial<TestUser> = {}
): Promise<void> {
  const mockUser = {
    id: '00000000-0000-0000-0000-000000000001',
    email: user.email || 'test@example.com',
    first_name: user.firstName || 'Test',
    last_name: user.lastName || 'User',
    subscription_tier: user.subscriptionTier || 'free',
    created_at: new Date().toISOString(),
  };
  
  // Mock the auth verification endpoint
  await page.route('**/api/v1/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser),
    });
  });
}

/**
 * Register a new user via UI
 */
export async function registerViaUI(
  page: Page,
  user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }
): Promise<void> {
  await page.goto('/register');
  
  // Fill registration form
  await page.fill('input[name="first_name"]', user.firstName);
  await page.fill('input[name="last_name"]', user.lastName);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.fill('input[name="confirm_password"]', user.password);
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Should redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

/**
 * Generate a unique email for testing
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}@example.com`;
}
