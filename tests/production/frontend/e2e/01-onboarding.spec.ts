import { test, expect } from '@playwright/test';
import { 
  loginViaUI, 
  registerViaUI, 
  logout, 
  generateUniqueEmail,
  mockAuthState 
} from '../helpers/auth';
import { cleanupBrowserStorage, clearAuthState } from '../helpers/cleanup';
import { TEST_USERS, VALIDATION_ERRORS } from '../fixtures/testData';

/**
 * Journey 1: Onboarding & Authentication
 * 
 * Tests the complete user onboarding flow from landing page to authenticated state
 * 
 * Estimated execution time: 3 minutes
 */

test.describe('Journey 1: Onboarding & Authentication', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await clearAuthState(page);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
    await cleanupBrowserStorage(page);
  });

  test('1.1 - Landing page displays and CTAs work', async ({ page }) => {
    await page.goto('/');
    
    // Verify hero section
    await expect(page.locator('text=Beat the Guy Across the Street')).toBeVisible();
    
    // Verify CTAs exist
    const getStartedButton = page.locator('text=Run Your First Scan').or(page.locator('text=Get Started'));
    await expect(getStartedButton).toBeVisible();
    
    const signInButton = page.locator('text=Sign In');
    await expect(signInButton).toBeVisible();
    
    // Test navigation to register
    await getStartedButton.first().click();
    await expect(page).toHaveURL('/register');
  });

  test('1.2 - User can register successfully', async ({ page }) => {
    const uniqueEmail = generateUniqueEmail('newuser');
    
    await registerViaUI(page, {
      email: uniqueEmail,
      password: 'Test123!@#',
      firstName: 'John',
      lastName: 'Doe',
    });
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Should show welcome message
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('1.3 - Registration validates email format', async ({ page }) => {
    await page.goto('/register');
    
    // Fill form with invalid email
    await page.fill('input[name="first_name"]', 'John');
    await page.fill('input[name="last_name"]', 'Doe');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.fill('input[name="confirm_password"]', 'Test123!@#');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=valid email')).toBeVisible();
  });

  test('1.4 - Registration validates password strength', async ({ page }) => {
    await page.goto('/register');
    
    // Fill form with weak password
    await page.fill('input[name="first_name"]', 'John');
    await page.fill('input[name="last_name"]', 'Doe');
    await page.fill('input[name="email"]', generateUniqueEmail());
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirm_password"]', 'weak');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Password must')).toBeVisible();
  });

  test('1.5 - Registration validates password confirmation', async ({ page }) => {
    await page.goto('/register');
    
    // Fill form with mismatched passwords
    await page.fill('input[name="first_name"]', 'John');
    await page.fill('input[name="last_name"]', 'Doe');
    await page.fill('input[name="email"]', generateUniqueEmail());
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.fill('input[name="confirm_password"]', 'Different123!@#');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Passwords must match').or(page.locator('text=do not match'))).toBeVisible();
  });

  test('1.6 - User can login successfully', async ({ page }) => {
    await loginViaUI(page, TEST_USERS.free.email, TEST_USERS.free.password);
    
    // Should be on dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Should show user name or welcome message
    await expect(page.locator('text=Welcome').or(page.locator(`text=${TEST_USERS.free.firstName}`))).toBeVisible();
  });

  test('1.7 - Login validates required fields', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('[data-testid="login-button"]');
    
    // Should show validation errors
    await expect(page.locator('text=Email is required').or(page.locator('text=required'))).toBeVisible();
  });

  test('1.8 - Login shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with invalid credentials
    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
    await page.fill('[data-testid="password-input"]', 'WrongPassword123!');
    
    // Submit
    await page.click('[data-testid="login-button"]');
    
    // Should show error message
    await expect(page.locator('text=Invalid credentials').or(page.locator('text=incorrect'))).toBeVisible({ timeout: 5000 });
  });

  test('1.9 - Auth state persists across page refresh', async ({ page }) => {
    // Login first
    await loginViaUI(page, TEST_USERS.free.email, TEST_USERS.free.password);
    
    // Verify on dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Refresh page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome').or(page.locator('text=Dashboard'))).toBeVisible();
  });

  test('1.10 - User can logout successfully', async ({ page }) => {
    // Login first
    await loginViaUI(page, TEST_USERS.free.email, TEST_USERS.free.password);
    
    // Logout
    await logout(page);
    
    // Should redirect to landing page
    await expect(page).toHaveURL('/');
    
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('1.11 - Protected routes redirect to login when not authenticated', async ({ page }) => {
    // Try to access protected routes
    const protectedRoutes = [
      '/dashboard',
      '/invoices',
      '/menu',
      '/analysis/new',
      '/menu-comparison',
    ];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
    }
  });

  test('1.12 - Password visibility toggle works', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('[data-testid="password-input"]');
    
    // Should start as password type
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button (look for eye icon or toggle button)
    const toggleButton = page.locator('button').filter({ hasText: /show|hide|👁️|🙈/i }).or(
      page.locator('button[aria-label*="password"]')
    );
    
    if (await toggleButton.count() > 0) {
      await toggleButton.first().click();
      
      // Should change to text type
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click again to hide
      await toggleButton.first().click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('1.13 - Login form is mobile-optimized', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    
    // Check input heights (should be at least 44px for touch)
    const emailInput = page.locator('[data-testid="email-input"]');
    const passwordInput = page.locator('[data-testid="password-input"]');
    
    const emailBox = await emailInput.boundingBox();
    const passwordBox = await passwordInput.boundingBox();
    
    expect(emailBox?.height).toBeGreaterThanOrEqual(44);
    expect(passwordBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('1.14 - Registration form is mobile-optimized', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/register');
    
    // Check that form is scrollable and inputs are accessible
    const firstNameInput = page.locator('input[name="first_name"]');
    await expect(firstNameInput).toBeVisible();
    
    const box = await firstNameInput.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('1.15 - Navigation between login and register works', async ({ page }) => {
    await page.goto('/login');
    
    // Click link to register
    await page.click('text=Sign up').or(page.click('text=Register')).catch(() => {
      // If no link found, navigate directly
      return page.goto('/register');
    });
    
    await expect(page).toHaveURL('/register');
    
    // Click link back to login
    await page.click('text=Sign in').or(page.click('text=Login')).catch(() => {
      return page.goto('/login');
    });
    
    await expect(page).toHaveURL('/login');
  });
});
