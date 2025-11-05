import { Page } from '@playwright/test';

/**
 * Form Helper Utilities
 * 
 * Provides reusable functions for filling forms across different workflows
 */

/**
 * Fill analysis form
 */
export async function fillAnalysisForm(
  page: Page,
  data: {
    restaurant_name: string;
    location: string;
    category?: string;
    tier?: 'free' | 'premium';
  }
): Promise<void> {
  // Fill restaurant name
  await page.fill('[data-testid="restaurant-name"]', data.restaurant_name);
  
  // Fill location
  await page.fill('[data-testid="location"]', data.location);
  
  // Select category (if provided)
  if (data.category) {
    await page.click('[data-testid="category"]');
    await page.waitForSelector('[role="option"]', { state: 'visible' });
    await page.click(`[role="option"]:has-text("${data.category}")`);
  }
  
  // Select tier (if provided)
  if (data.tier) {
    await page.click(`[data-testid="tier-${data.tier}"]`);
  }
}

/**
 * Fill menu comparison form
 */
export async function fillComparisonForm(
  page: Page,
  data: {
    restaurant_name: string;
    location: string;
    category?: string;
    radius_miles?: number;
  }
): Promise<void> {
  // Fill restaurant name
  await page.fill('input[name="restaurant_name"]', data.restaurant_name);
  
  // Fill location
  await page.fill('input[name="location"]', data.location);
  
  // Select category (if provided)
  if (data.category) {
    await page.selectOption('select[name="category"]', data.category);
  }
  
  // Fill radius (if provided)
  if (data.radius_miles) {
    await page.fill('input[name="radius_miles"]', data.radius_miles.toString());
  }
}

/**
 * Fill login form
 */
export async function fillLoginForm(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
}

/**
 * Fill registration form
 */
export async function fillRegistrationForm(
  page: Page,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }
): Promise<void> {
  await page.fill('input[name="first_name"]', data.firstName);
  await page.fill('input[name="last_name"]', data.lastName);
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="password"]', data.password);
  await page.fill('input[name="confirm_password"]', data.password);
}

/**
 * Select competitors in menu comparison flow
 */
export async function selectCompetitors(
  page: Page,
  count: number = 2
): Promise<void> {
  for (let i = 0; i < count; i++) {
    await page.click(`.cursor-pointer >> nth=${i}`);
    
    // Wait for selection to register
    await page.waitForSelector(`text=${i + 1}/${count} Selected`, {
      state: 'visible',
      timeout: 3000,
    });
  }
}

/**
 * Edit line item in review table (invoice or menu)
 */
export async function editLineItem(
  page: Page,
  itemIndex: number,
  updates: {
    description?: string;
    quantity?: number;
    unitPrice?: number;
  }
): Promise<void> {
  // Click edit button
  await page.click(`button[aria-label="Edit item ${itemIndex}"]`);
  
  // Update fields
  if (updates.description) {
    await page.fill('input[aria-label="Description"]', updates.description);
  }
  
  if (updates.quantity) {
    await page.fill('input[aria-label="Quantity"]', updates.quantity.toString());
  }
  
  if (updates.unitPrice) {
    await page.fill('input[aria-label="Unit price"]', updates.unitPrice.toString());
  }
  
  // Save changes
  await page.click('button[aria-label="Save changes"]');
  
  // Wait for save to complete
  await page.waitForTimeout(500);
}

/**
 * Submit form and wait for navigation
 */
export async function submitForm(
  page: Page,
  buttonText: string,
  expectedUrl?: string | RegExp
): Promise<void> {
  await page.click(`button:has-text("${buttonText}")`);
  
  if (expectedUrl) {
    await page.waitForURL(expectedUrl, { timeout: 10000 });
  }
}

/**
 * Verify form validation errors
 */
export async function verifyValidationErrors(
  page: Page,
  expectedErrors: string[]
): Promise<void> {
  for (const error of expectedErrors) {
    await page.waitForSelector(`text=${error}`, {
      state: 'visible',
      timeout: 3000,
    });
  }
}

/**
 * Clear form fields
 */
export async function clearForm(page: Page, fieldSelectors: string[]): Promise<void> {
  for (const selector of fieldSelectors) {
    await page.fill(selector, '');
  }
}

/**
 * Check if form is valid (submit button enabled)
 */
export async function isFormValid(
  page: Page,
  submitButtonSelector: string = 'button[type="submit"]'
): Promise<boolean> {
  const isDisabled = await page.isDisabled(submitButtonSelector);
  return !isDisabled;
}

/**
 * Wait for form submission to complete
 */
export async function waitForFormSubmission(
  page: Page,
  options: {
    loadingText?: string;
    successText?: string;
    timeout?: number;
  } = {}
): Promise<void> {
  const {
    loadingText = 'Loading',
    successText = 'Success',
    timeout = 10000,
  } = options;
  
  // Wait for loading state
  await page.waitForSelector(`text=${loadingText}`, {
    state: 'visible',
    timeout: 3000,
  });
  
  // Wait for success state
  await page.waitForSelector(`text=${successText}`, {
    state: 'visible',
    timeout,
  });
}
