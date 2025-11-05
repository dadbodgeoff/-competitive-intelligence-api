import { Page } from '@playwright/test';

/**
 * Cleanup Helper Utilities
 * 
 * Provides functions for cleaning up test data after tests
 */

/**
 * Clean up test user via API
 */
export async function cleanupTestUser(userId: string): Promise<void> {
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:8000';
  
  try {
    await fetch(`${apiUrl}/api/v1/test/cleanup/user/${userId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.warn(`Failed to cleanup test user ${userId}:`, error);
  }
}

/**
 * Clean up test data from browser storage
 */
export async function cleanupBrowserStorage(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (error) {
    // Ignore errors if page hasn't navigated yet or localStorage is not accessible
    console.log('Could not clear browser storage (page may not be loaded yet)');
  }
}

/**
 * Clean up test invoices
 */
export async function cleanupTestInvoices(page: Page): Promise<void> {
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:8000';
  
  try {
    await page.request.delete(`${apiUrl}/api/v1/test/cleanup/invoices`);
  } catch (error) {
    console.warn('Failed to cleanup test invoices:', error);
  }
}

/**
 * Clean up test menus
 */
export async function cleanupTestMenus(page: Page): Promise<void> {
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:8000';
  
  try {
    await page.request.delete(`${apiUrl}/api/v1/test/cleanup/menus`);
  } catch (error) {
    console.warn('Failed to cleanup test menus:', error);
  }
}

/**
 * Clean up test analyses
 */
export async function cleanupTestAnalyses(page: Page): Promise<void> {
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:8000';
  
  try {
    await page.request.delete(`${apiUrl}/api/v1/test/cleanup/analyses`);
  } catch (error) {
    console.warn('Failed to cleanup test analyses:', error);
  }
}

/**
 * Clean up test comparisons
 */
export async function cleanupTestComparisons(page: Page): Promise<void> {
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:8000';
  
  try {
    await page.request.delete(`${apiUrl}/api/v1/test/cleanup/comparisons`);
  } catch (error) {
    console.warn('Failed to cleanup test comparisons:', error);
  }
}

/**
 * Clean up all test data
 * Use this in afterAll hooks for comprehensive cleanup
 */
export async function cleanupAllTestData(page: Page): Promise<void> {
  await cleanupBrowserStorage(page);
  await cleanupTestInvoices(page);
  await cleanupTestMenus(page);
  await cleanupTestAnalyses(page);
  await cleanupTestComparisons(page);
}

/**
 * Reset database to clean state (for integration tests)
 * WARNING: Only use in test environments!
 */
export async function resetTestDatabase(): Promise<void> {
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:8000';
  
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('resetTestDatabase can only be called in test environment');
  }
  
  try {
    await fetch(`${apiUrl}/api/v1/test/reset-database`, {
      method: 'POST',
    });
  } catch (error) {
    console.warn('Failed to reset test database:', error);
  }
}

/**
 * Clear cookies and auth state
 */
export async function clearAuthState(page: Page): Promise<void> {
  await page.context().clearCookies();
  await cleanupBrowserStorage(page);
}

/**
 * Delete uploaded test files
 */
export async function cleanupUploadedFiles(page: Page, fileUrls: string[]): Promise<void> {
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:8000';
  
  for (const fileUrl of fileUrls) {
    try {
      await page.request.delete(`${apiUrl}/api/v1/test/cleanup/file`, {
        data: { file_url: fileUrl },
      });
    } catch (error) {
      console.warn(`Failed to cleanup file ${fileUrl}:`, error);
    }
  }
}

/**
 * Wait for cleanup operations to complete
 */
export async function waitForCleanup(delayMs: number = 1000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, delayMs));
}
