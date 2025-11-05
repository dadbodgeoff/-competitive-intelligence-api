import { defineConfig, devices } from '@playwright/test';

/**
 * Production E2E Test Configuration
 * 
 * Targets:
 * - Full suite execution: < 21 minutes
 * - Flakiness rate: < 2%
 * - Coverage: 95%+ of critical user flows
 */
export default defineConfig({
  testDir: './e2e',
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  
  // Timeouts
  timeout: 60 * 1000, // 60 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
  
  // Reporting
  reporter: [
    ['html', { outputFolder: '../reports/frontend-coverage' }],
    ['json', { outputFile: '../reports/frontend-coverage/results.json' }],
    ['list'],
  ],
  
  // Global test settings
  use: {
    // Base URL for the application
    baseURL: process.env.VITE_APP_URL || 'http://localhost:5173',
    
    // Capture artifacts on failure
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Action timeouts
    actionTimeout: 15 * 1000, // 15 seconds for actions
    navigationTimeout: 30 * 1000, // 30 seconds for navigation
  },

  // Test projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Mobile-optimized inputs (48px height, 16px font)
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        // Mobile viewport for responsive tests
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
      },
    },
  ],

  // Web server configuration (optional - for local development)
  webServer: process.env.CI ? undefined : {
    command: 'cd ../../../frontend && npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120 * 1000, // 2 minutes to start
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
