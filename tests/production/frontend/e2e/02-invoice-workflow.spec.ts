import { test, expect } from '@playwright/test';
import { loginViaUI } from '../helpers/auth';
import { uploadFile, uploadAndWaitForParse, waitForStreamingComplete } from '../helpers/upload';
import { editLineItem } from '../helpers/forms';
import { cleanupBrowserStorage, cleanupTestInvoices } from '../helpers/cleanup';
import { TEST_USERS, TEST_FILES, TIMEOUTS } from '../fixtures/testData';

/**
 * Journey 2: Invoice Workflow
 * 
 * Tests the complete invoice processing flow from upload to analytics
 * 
 * Estimated execution time: 5 minutes
 */

test.describe('Journey 2: Invoice Workflow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginViaUI(page, TEST_USERS.free.email, TEST_USERS.free.password);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
    await cleanupBrowserStorage(page);
    await cleanupTestInvoices(page);
  });

  test('2.1 - User can navigate to invoice upload page', async ({ page }) => {
    // From dashboard, navigate to invoice upload
    await page.goto('/dashboard');
    
    // Look for invoice upload link/button
    const uploadLink = page.locator('text=Upload Invoice').or(
      page.locator('text=Invoices')
    );
    
    await uploadLink.first().click();
    
    // Should navigate to upload page
    await expect(page).toHaveURL(/\/(invoices\/upload|invoices)/);
  });

  test('2.2 - Invoice upload page displays correctly', async ({ page }) => {
    await page.goto('/invoices/upload');
    
    // Should show upload interface
    await expect(page.locator('input[type="file"]')).toBeVisible();
    
    // Should show vendor hint input (optional)
    const vendorInput = page.locator('input[id="vendor"]');
    if (await vendorInput.count() > 0) {
      await expect(vendorInput).toBeVisible();
    }
    
    // Should show instructions or help text
    await expect(page.locator('text=Upload').or(page.locator('text=invoice'))).toBeVisible();
  });

  test('2.3 - User can upload invoice PDF', async ({ page }) => {
    await page.goto('/invoices/upload');
    
    // Optional: Fill vendor hint
    const vendorInput = page.locator('input[id="vendor"]');
    if (await vendorInput.count() > 0) {
      await vendorInput.fill('Sysco');
    }
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.invoice.small);
    
    // Should show progress indicator
    await expect(page.locator('[role="progressbar"]').or(
      page.locator('text=Parsing').or(
        page.locator('text=Processing')
      )
    )).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  test('2.4 - Streaming progress updates display', async ({ page }) => {
    await page.goto('/invoices/upload');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.invoice.small);
    
    // Wait for streaming to start
    await expect(page.locator('text=AI is reading').or(
      page.locator('text=Parsing').or(
        page.locator('text=Processing')
      )
    )).toBeVisible({ timeout: TIMEOUTS.medium });
    
    // Progress bar should be visible
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('text=Ready for Review').or(
      page.locator('text=Complete').or(
        page.locator('text=Review')
      )
    )).toBeVisible({ timeout: TIMEOUTS.streaming });
  });

  test('2.5 - Parsed invoice items display in review table', async ({ page }) => {
    await page.goto('/invoices/upload');
    
    // Upload and wait for parsing
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.invoice.small);
    
    // Wait for completion
    await expect(page.locator('text=Ready for Review').or(
      page.locator('text=Review')
    )).toBeVisible({ timeout: TIMEOUTS.streaming });
    
    // Should show table with items
    await expect(page.locator('table').or(
      page.locator('[role="table"]')
    )).toBeVisible();
    
    // Should show at least one item
    await expect(page.locator('td').or(
      page.locator('[role="cell"]')
    )).toBeVisible();
  });

  test('2.6 - User can edit line items in review table', async ({ page }) => {
    await page.goto('/invoices/upload');
    
    // Upload and wait for parsing
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.invoice.small);
    
    await expect(page.locator('text=Ready for Review').or(
      page.locator('text=Review')
    )).toBeVisible({ timeout: TIMEOUTS.streaming });
    
    // Look for edit button
    const editButton = page.locator('button[aria-label*="Edit"]').or(
      page.locator('button:has-text("Edit")')
    ).first();
    
    if (await editButton.count() > 0) {
      await editButton.click();
      
      // Should show edit form or inline editing
      await expect(page.locator('input[aria-label*="Description"]').or(
        page.locator('input[type="text"]')
      )).toBeVisible();
      
      // Edit description
      const descInput = page.locator('input[aria-label*="Description"]').or(
        page.locator('input[type="text"]')
      ).first();
      await descInput.fill('Updated Item Description');
      
      // Save changes
      const saveButton = page.locator('button[aria-label*="Save"]').or(
        page.locator('button:has-text("Save")')
      ).first();
      await saveButton.click();
      
      // Verify update
      await expect(page.locator('text=Updated Item Description')).toBeVisible();
    }
  });

  test('2.7 - User can save reviewed invoice', async ({ page }) => {
    await page.goto('/invoices/upload');
    
    // Upload and wait for parsing
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.invoice.small);
    
    await expect(page.locator('text=Ready for Review').or(
      page.locator('text=Review')
    )).toBeVisible({ timeout: TIMEOUTS.streaming });
    
    // Click save button
    const saveButton = page.locator('button:has-text("Save Invoice")').or(
      page.locator('button:has-text("Save")')
    );
    await saveButton.click();
    
    // Should show success message
    await expect(page.locator('text=saved').or(
      page.locator('text=Success')
    )).toBeVisible({ timeout: TIMEOUTS.medium });
    
    // Should redirect to invoice detail or list page
    await expect(page).toHaveURL(/\/(invoices\/[a-f0-9-]+|invoices)/);
  });

  test('2.8 - User can view invoice list', async ({ page }) => {
    await page.goto('/invoices');
    
    // Should show invoices page
    await expect(page.locator('text=Invoices')).toBeVisible();
    
    // Should show list or table
    const hasTable = await page.locator('table').count() > 0;
    const hasCards = await page.locator('[class*="card"]').count() > 0;
    
    expect(hasTable || hasCards).toBeTruthy();
  });

  test('2.9 - User can navigate to invoice detail page', async ({ page }) => {
    await page.goto('/invoices');
    
    // Look for clickable invoice item
    const invoiceItem = page.locator('.cursor-pointer').or(
      page.locator('tr[role="button"]').or(
        page.locator('a[href*="/invoices/"]')
      )
    ).first();
    
    if (await invoiceItem.count() > 0) {
      await invoiceItem.click();
      
      // Should navigate to detail page
      await expect(page).toHaveURL(/\/invoices\/[a-f0-9-]+/);
      
      // Should show invoice details
      await expect(page.locator('text=Invoice').or(
        page.locator('text=Details')
      )).toBeVisible();
    }
  });

  test('2.10 - Invoice detail page shows correct data', async ({ page }) => {
    // First upload an invoice to get a detail page
    await page.goto('/invoices/upload');
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.invoice.small);
    
    await expect(page.locator('text=Ready for Review').or(
      page.locator('text=Review')
    )).toBeVisible({ timeout: TIMEOUTS.streaming });
    
    // Save invoice
    const saveButton = page.locator('button:has-text("Save Invoice")').or(
      page.locator('button:has-text("Save")')
    );
    await saveButton.click();
    
    // Should be on detail page
    await page.waitForURL(/\/invoices\/[a-f0-9-]+/, { timeout: TIMEOUTS.medium });
    
    // Should show invoice data
    await expect(page.locator('table').or(
      page.locator('[role="table"]')
    )).toBeVisible();
    
    // Should show line items
    await expect(page.locator('td').or(
      page.locator('[role="cell"]')
    )).toBeVisible();
  });

  test('2.11 - Price analytics dashboard loads', async ({ page }) => {
    await page.goto('/price-analytics');
    
    // Should show dashboard
    await expect(page.locator('text=Price Analytics').or(
      page.locator('text=Analytics')
    )).toBeVisible();
    
    // Should show summary cards or stats
    const hasCards = await page.locator('[class*="card"]').count() > 0;
    const hasStats = await page.locator('text=Total').count() > 0;
    
    expect(hasCards || hasStats).toBeTruthy();
  });

  test('2.12 - Invalid file type shows error', async ({ page }) => {
    await page.goto('/invoices/upload');
    
    // Try to upload invalid file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.invoice.invalid);
    
    // Should show error message
    await expect(page.locator('text=Invalid').or(
      page.locator('text=error').or(
        page.locator('text=supported')
      )
    )).toBeVisible({ timeout: TIMEOUTS.medium });
  });
});
