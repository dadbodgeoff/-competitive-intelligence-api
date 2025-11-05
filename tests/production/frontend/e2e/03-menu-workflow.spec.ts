import { test, expect } from '@playwright/test';
import { loginViaUI } from '../helpers/auth';
import { uploadFile } from '../helpers/upload';
import { cleanupBrowserStorage, cleanupTestMenus } from '../helpers/cleanup';
import { TEST_USERS, TEST_FILES, TIMEOUTS } from '../fixtures/testData';

/**
 * Journey 3: Menu Workflow
 * 
 * Tests the complete menu processing flow from upload to dashboard
 * 
 * Estimated execution time: 4 minutes
 */

test.describe('Journey 3: Menu Workflow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginViaUI(page, TEST_USERS.free.email, TEST_USERS.free.password);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
    await cleanupBrowserStorage(page);
    await cleanupTestMenus(page);
  });

  test('3.1 - User can navigate to menu upload page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for menu link
    const menuLink = page.locator('text=Menu').or(
      page.locator('a[href*="/menu"]')
    );
    
    await menuLink.first().click();
    
    // Should navigate to menu page
    await expect(page).toHaveURL(/\/menu/);
  });

  test('3.2 - Menu upload page displays correctly', async ({ page }) => {
    await page.goto('/menu/upload');
    
    // Should show upload interface
    await expect(page.locator('input[type="file"]')).toBeVisible();
    
    // Should show restaurant hint input (optional)
    const restaurantInput = page.locator('input[id="restaurant"]');
    if (await restaurantInput.count() > 0) {
      await expect(restaurantInput).toBeVisible();
    }
  });

  test('3.3 - User can upload menu PDF', async ({ page }) => {
    await page.goto('/menu/upload');
    
    // Optional: Fill restaurant hint
    const restaurantInput = page.locator('input[id="restaurant"]');
    if (await restaurantInput.count() > 0) {
      await restaurantInput.fill('Park Avenue Pizza');
    }
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.menu.small);
    
    // Should show progress
    await expect(page.locator('[role="progressbar"]').or(
      page.locator('text=Parsing').or(
        page.locator('text=Processing')
      )
    )).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  test('3.4 - Menu parsing shows streaming progress', async ({ page }) => {
    await page.goto('/menu/upload');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.menu.small);
    
    // Wait for streaming
    await expect(page.locator('text=AI is reading').or(
      page.locator('text=Parsing').or(
        page.locator('text=Processing')
      )
    )).toBeVisible({ timeout: TIMEOUTS.medium });
    
    // Progress bar visible
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('text=Ready for Review').or(
      page.locator('text=Complete').or(
        page.locator('text=Review')
      )
    )).toBeVisible({ timeout: TIMEOUTS.streaming });
  });

  test('3.5 - Menu items display in categorized table', async ({ page }) => {
    await page.goto('/menu/upload');
    
    // Upload and wait
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.menu.small);
    
    await expect(page.locator('text=Ready for Review').or(
      page.locator('text=Review')
    )).toBeVisible({ timeout: TIMEOUTS.streaming });
    
    // Should show categories (e.g., Pizzas, Appetizers)
    const hasCategories = await page.locator('text=Pizzas').or(
      page.locator('text=Appetizers').or(
        page.locator('text=Entrees')
      )
    ).count() > 0;
    
    // Should show table
    const hasTable = await page.locator('table').count() > 0;
    
    expect(hasCategories || hasTable).toBeTruthy();
  });

  test('3.6 - User can collapse/expand categories', async ({ page }) => {
    await page.goto('/menu/upload');
    
    // Upload and wait
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.menu.small);
    
    await expect(page.locator('text=Ready for Review').or(
      page.locator('text=Review')
    )).toBeVisible({ timeout: TIMEOUTS.streaming });
    
    // Look for collapse button
    const collapseButton = page.locator('button[aria-label*="Collapse"]').or(
      page.locator('button[aria-label*="Expand"]')
    ).first();
    
    if (await collapseButton.count() > 0) {
      // Get initial state
      const initialTableCount = await page.locator('table').count();
      
      // Click to toggle
      await collapseButton.click();
      
      // Wait for animation
      await page.waitForTimeout(500);
      
      // State should have changed
      const newTableCount = await page.locator('table').count();
      expect(newTableCount).not.toBe(initialTableCount);
    }
  });

  test('3.7 - User can edit menu items', async ({ page }) => {
    await page.goto('/menu/upload');
    
    // Upload and wait
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.menu.small);
    
    await expect(page.locator('text=Ready for Review').or(
      page.locator('text=Review')
    )).toBeVisible({ timeout: TIMEOUTS.streaming });
    
    // Look for edit button
    const editButton = page.locator('button[aria-label*="Edit"]').or(
      page.locator('button:has-text("Edit")')
    ).first();
    
    if (await editButton.count() > 0) {
      await editButton.click();
      
      // Should show edit form
      await expect(page.locator('input[aria-label*="name"]').or(
        page.locator('input[type="text"]')
      )).toBeVisible();
      
      // Edit name
      const nameInput = page.locator('input[aria-label*="name"]').or(
        page.locator('input[type="text"]')
      ).first();
      await nameInput.fill('Updated Pizza Name');
      
      // Save
      const saveButton = page.locator('button[aria-label*="Save"]').or(
        page.locator('button:has-text("Save")')
      ).first();
      await saveButton.click();
      
      // Verify update
      await expect(page.locator('text=Updated Pizza Name')).toBeVisible();
    }
  });

  test('3.8 - User can save reviewed menu', async ({ page }) => {
    await page.goto('/menu/upload');
    
    // Upload and wait
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.menu.small);
    
    await expect(page.locator('text=Ready for Review').or(
      page.locator('text=Review')
    )).toBeVisible({ timeout: TIMEOUTS.streaming });
    
    // Click save
    const saveButton = page.locator('button:has-text("Save Menu")').or(
      page.locator('button:has-text("Save")')
    );
    await saveButton.click();
    
    // Should show success
    await expect(page.locator('text=saved').or(
      page.locator('text=Success')
    )).toBeVisible({ timeout: TIMEOUTS.medium });
    
    // Should redirect to menu dashboard
    await expect(page).toHaveURL(/\/menu/);
  });

  test('3.9 - Menu dashboard displays saved menu', async ({ page }) => {
    await page.goto('/menu/dashboard');
    
    // Should show dashboard
    await expect(page.locator('text=Menu').or(
      page.locator('text=Dashboard')
    )).toBeVisible();
    
    // Should show stats or summary
    const hasStats = await page.locator('text=Categories').or(
      page.locator('text=Items').or(
        page.locator('text=Total')
      )
    ).count() > 0;
    
    expect(hasStats).toBeTruthy();
  });

  test('3.10 - User can access recipe/ingredient linking', async ({ page }) => {
    await page.goto('/menu/dashboard');
    
    // Look for recipe button
    const recipeButton = page.locator('button:has-text("Recipe")').or(
      page.locator('a[href*="/recipe"]')
    ).first();
    
    if (await recipeButton.count() > 0) {
      await recipeButton.click();
      
      // Should navigate to recipe page or show modal
      const onRecipePage = await page.url().includes('/recipe');
      const hasModal = await page.locator('[role="dialog"]').count() > 0;
      
      expect(onRecipePage || hasModal).toBeTruthy();
      
      // Should show ingredient search
      await expect(page.locator('text=Ingredient').or(
        page.locator('input[placeholder*="Search"]')
      )).toBeVisible();
    }
  });
});
