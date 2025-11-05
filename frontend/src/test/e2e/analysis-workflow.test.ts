import { test, expect } from '@playwright/test';

test.describe('Analysis Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for consistent testing
    
    // Mock auth verification endpoint (called by ProtectedRoute)
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          subscription_tier: 'free',
          created_at: '2023-01-01T00:00:00Z'
        })
      });
    });
    
    await page.route('**/api/v1/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          token_type: 'bearer',
          user: {
            id: '123',
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            subscription_tier: 'free',
            created_at: '2023-01-01T00:00:00Z'
          }
        })
      });
    });

    await page.route('**/api/v1/analysis/run', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          analysis_id: 'test-analysis-123',
          status: 'pending',
          message: 'Analysis started successfully'
        })
      });
    });

    await page.route('**/api/v1/analysis/test-analysis-123/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          analysis_id: 'test-analysis-123',
          status: 'completed',
          progress_percentage: 100,
          current_step: 'Analysis complete'
        })
      });
    });

    await page.route('**/api/v1/analysis/test-analysis-123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
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
              address: '123 Main St, New York, NY'
            }
          ],
          insights: [
            {
              title: 'Price Competition',
              description: 'Competitor offers lower prices',
              confidence: 'high',
              type: 'threat',
              proof_quote: 'Great pizza at affordable prices',
              mention_count: 5,
              competitor_name: 'Competitor Pizza'
            }
          ],
          processing_time_seconds: 45,
          created_at: '2023-01-01T00:00:00Z',
          completed_at: '2023-01-01T00:01:00Z'
        })
      });
    });
  });

  test.skip('complete analysis workflow from login to results', async ({ page }) => {
    // Start at login page
    await page.goto('/login');

    // Login
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome back, John!')).toBeVisible();

    // Start new analysis
    await page.click('text=Analyze Competitors');
    await expect(page).toHaveURL('/analysis/new');

    // Fill analysis form
    await page.fill('[data-testid="restaurant-name"]', 'Test Pizza');
    await page.fill('[data-testid="location"]', 'New York, NY');
    
    // Select category using Radix UI Select (click to open, wait for dropdown, then click option)
    await page.click('[data-testid="category"]');
    // Wait for the dropdown content to be visible (Radix renders in a portal)
    await page.waitForSelector('[role="option"]:has-text("Pizza")', { state: 'visible' });
    await page.click('[role="option"]:has-text("Pizza")');
    
    // Select free tier (should be default)
    await page.click('[data-testid="tier-free"]');

    // Submit form
    await page.click('text=Analyze Competitors');

    // With streaming mode, the form stays on /analysis/new and shows streaming results inline
    // Wait for streaming component to appear
    await expect(page).toHaveURL('/analysis/new');
    
    // Look for streaming analysis indicators (adjust selectors based on your StreamingAnalysisResults component)
    // The component should show analysis progress or results
    await expect(page.locator('text=Test Pizza').or(page.locator('text=Analysis'))).toBeVisible({ timeout: 10000 });

    // Verify results display
    await expect(page.locator('text=Competitor Pizza')).toBeVisible();
    await expect(page.locator('text=Price Competition')).toBeVisible();

    // Test tab navigation
    await page.click('text=Insights');
    await expect(page.locator('text=threat')).toBeVisible();

    await page.click('text=Evidence');
    await expect(page.locator('text=Great pizza at affordable prices')).toBeVisible();

    // Test CSV export
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export CSV');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('Test_Pizza_analysis_');
  });

  test.skip('mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/login');

    // Check mobile-optimized inputs
    const emailInput = page.locator('[data-testid="email-input"]');
    await expect(emailInput).toHaveCSS('height', '48px');
    await expect(emailInput).toHaveCSS('font-size', '16px');

    // Login and navigate to analysis form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await page.click('text=Analyze Competitors');

    // Check mobile form layout
    const restaurantInput = page.locator('[data-testid="restaurant-name"]');
    await expect(restaurantInput).toHaveCSS('height', '48px');

    // Check tier selector is touch-friendly
    const tierCard = page.locator('[data-testid="tier-free"]');
    const boundingBox = await tierCard.boundingBox();
    expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
  });

  test.skip('error handling', async ({ page }) => {
    // Mock error response
    await page.route('**/api/v1/analysis/run', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'ANALYSIS_NO_COMPETITORS',
          message: 'No competitors found in this area'
        })
      });
    });

    await page.goto('/login');
    
    // Login
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate to analysis form
    await page.click('text=Analyze Competitors');

    // Fill and submit form
    await page.fill('[data-testid="restaurant-name"]', 'Test Pizza');
    await page.fill('[data-testid="location"]', 'Remote Location');
    await page.click('text=Analyze Competitors');

    // Should show error message
    await expect(page.locator('text=No competitors found in this area')).toBeVisible();
  });

  test.skip('form validation', async ({ page }) => {
    await page.goto('/login');
    
    // Login
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate to analysis form
    await page.click('text=Analyze Competitors');

    // Try to submit empty form
    await page.click('text=Analyze Competitors');

    // Should show validation errors
    await expect(page.locator('text=Restaurant name is required')).toBeVisible();
    await expect(page.locator('text=Location is required')).toBeVisible();
  });

  test.skip('direct navigation to analysis pages', async ({ page }) => {
    // Mock authentication check
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          subscription_tier: 'free'
        })
      });
    });

    // Test direct navigation to progress page
    await page.goto('/analysis/test-analysis-123/progress');
    await expect(page.locator('text=Analysis in Progress')).toBeVisible();

    // Test direct navigation to results page
    await page.goto('/analysis/test-analysis-123/results');
    await expect(page.locator('text=Test Pizza')).toBeVisible();

    // Test invalid analysis ID handling
    await page.goto('/analysis/invalid-id/progress');
    await expect(page).toHaveURL('/dashboard'); // Should redirect to dashboard

    // Test malformed UUID handling
    await page.goto('/analysis/not-a-uuid/results');
    await expect(page).toHaveURL('/dashboard'); // Should redirect to dashboard
  });

  test.skip('progress polling and status updates', async ({ page }) => {
    let statusCallCount = 0;
    
    // Mock progressive status updates
    await page.route('**/api/v1/analysis/test-analysis-123/status', async route => {
      statusCallCount++;
      
      if (statusCallCount <= 2) {
        // First few calls: processing
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            analysis_id: 'test-analysis-123',
            status: 'processing',
            progress_percentage: 25 + (statusCallCount * 25),
            current_step: `Step ${statusCallCount} of analysis`,
            estimated_time_remaining_seconds: 30 - (statusCallCount * 10)
          })
        });
      } else {
        // Later calls: completed
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            analysis_id: 'test-analysis-123',
            status: 'completed',
            progress_percentage: 100,
            current_step: 'Analysis complete',
            estimated_time_remaining_seconds: 0
          })
        });
      }
    });

    await page.goto('/login');
    
    // Login and start analysis
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.click('text=Analyze Competitors');
    await page.fill('[data-testid="restaurant-name"]', 'Test Pizza');
    await page.fill('[data-testid="location"]', 'New York, NY');
    await page.click('text=Analyze Competitors');

    // Should be on progress page
    await expect(page).toHaveURL('/analysis/test-analysis-123/progress');

    // Wait for progress updates
    await expect(page.locator('text=Step 1 of analysis')).toBeVisible();
    
    // Should eventually complete and redirect
    await page.waitForURL('/analysis/test-analysis-123/results', { timeout: 10000 });
    
    // Verify multiple status API calls were made
    expect(statusCallCount).toBeGreaterThan(2);
  });

  test.skip('browser navigation and back button handling', async ({ page }) => {
    await page.goto('/login');
    
    // Login
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate through the flow
    await page.click('text=Analyze Competitors');
    await page.fill('[data-testid="restaurant-name"]', 'Test Pizza');
    await page.fill('[data-testid="location"]', 'New York, NY');
    await page.click('text=Analyze Competitors');

    // Should be on progress page
    await expect(page).toHaveURL('/analysis/test-analysis-123/progress');

    // Wait for redirect to results
    await page.waitForURL('/analysis/test-analysis-123/results');

    // Test back button - should go back to progress page
    await page.goBack();
    await expect(page).toHaveURL('/analysis/test-analysis-123/progress');

    // Test forward button
    await page.goForward();
    await expect(page).toHaveURL('/analysis/test-analysis-123/results');

    // Test navigation to dashboard and back
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Go back to results
    await page.goBack();
    await expect(page).toHaveURL('/analysis/test-analysis-123/results');
  });
});