import { Page } from '@playwright/test';

/**
 * File Upload Helper Utilities
 * 
 * Provides reusable functions for file uploads and streaming progress
 */

/**
 * Upload a file via file input
 */
export async function uploadFile(
  page: Page,
  filePath: string
): Promise<void> {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);
}

/**
 * Upload file and wait for parsing to complete
 * Used for invoice and menu uploads
 */
export async function uploadAndWaitForParse(
  page: Page,
  filePath: string,
  options: {
    timeout?: number;
    successText?: string;
  } = {}
): Promise<void> {
  const {
    timeout = 60000, // 60 seconds default
    successText = 'Ready for Review',
  } = options;
  
  // Upload file
  await uploadFile(page, filePath);
  
  // Wait for parsing to start
  await page.waitForSelector('[role="progressbar"]', { 
    state: 'visible',
    timeout: 10000,
  });
  
  // Wait for completion
  await page.waitForSelector(`text=${successText}`, { 
    state: 'visible',
    timeout,
  });
}

/**
 * Upload invoice and wait for parsing
 */
export async function uploadInvoice(
  page: Page,
  filePath: string,
  vendorHint?: string
): Promise<void> {
  await page.goto('/invoices/upload');
  
  // Optional: Fill vendor hint
  if (vendorHint) {
    await page.fill('input[id="vendor"]', vendorHint);
  }
  
  // Upload and wait
  await uploadAndWaitForParse(page, filePath, {
    successText: 'Invoice Ready for Review',
  });
}

/**
 * Upload menu and wait for parsing
 */
export async function uploadMenu(
  page: Page,
  filePath: string,
  restaurantHint?: string
): Promise<void> {
  await page.goto('/menu/upload');
  
  // Optional: Fill restaurant hint
  if (restaurantHint) {
    await page.fill('input[id="restaurant"]', restaurantHint);
  }
  
  // Upload and wait
  await uploadAndWaitForParse(page, filePath, {
    successText: 'Menu Ready for Review',
  });
}

/**
 * Wait for streaming progress to complete
 * Monitors progress bar and status messages
 */
export async function waitForStreamingComplete(
  page: Page,
  options: {
    timeout?: number;
    progressSelector?: string;
    completeSelector?: string;
  } = {}
): Promise<void> {
  const {
    timeout = 60000,
    progressSelector = '[role="progressbar"]',
    completeSelector = 'text=Complete',
  } = options;
  
  // Wait for progress bar to appear
  await page.waitForSelector(progressSelector, {
    state: 'visible',
    timeout: 10000,
  });
  
  // Wait for completion indicator
  await page.waitForSelector(completeSelector, {
    state: 'visible',
    timeout,
  });
}

/**
 * Verify streaming progress updates are appearing
 * Useful for testing real-time updates
 */
export async function verifyStreamingUpdates(
  page: Page,
  expectedUpdates: string[]
): Promise<void> {
  for (const update of expectedUpdates) {
    await page.waitForSelector(`text=${update}`, {
      state: 'visible',
      timeout: 30000,
    });
  }
}

/**
 * Upload file with drag and drop
 * Alternative to file input for testing drag-and-drop functionality
 */
export async function uploadViaDragDrop(
  page: Page,
  filePath: string,
  dropZoneSelector: string = '[data-testid="drop-zone"]'
): Promise<void> {
  // Read file
  const buffer = await page.evaluate(async (path) => {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    return Array.from(new Uint8Array(arrayBuffer));
  }, filePath);
  
  // Create file in browser
  const dataTransfer = await page.evaluateHandle((data) => {
    const dt = new DataTransfer();
    const file = new File([new Uint8Array(data)], 'test-file.pdf', {
      type: 'application/pdf',
    });
    dt.items.add(file);
    return dt;
  }, buffer);
  
  // Trigger drop event
  await page.dispatchEvent(dropZoneSelector, 'drop', { dataTransfer });
}

/**
 * Mock file upload for testing without actual files
 */
export async function mockFileUpload(
  page: Page,
  mockResponse: {
    fileUrl: string;
    fileName: string;
  }
): Promise<void> {
  await page.route('**/api/invoices/upload', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponse),
    });
  });
}

/**
 * Verify file upload error handling
 */
export async function verifyUploadError(
  page: Page,
  expectedErrorMessage: string
): Promise<void> {
  await page.waitForSelector(`text=${expectedErrorMessage}`, {
    state: 'visible',
    timeout: 5000,
  });
}
