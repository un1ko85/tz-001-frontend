import { test, expect } from '@playwright/test';

test.describe.serial('Requests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create a new request', async ({ page }) => {
    // Open new request dialog
    await page.click('button:has-text("Create Request")');
    
    // Fill form
    await page.fill('#dialog-title', 'E2E Test Request');
    await page.fill('#dialog-desc', 'This is a test request created by Playwright.');
    
    // Submit
    await page.click('button:has-text("Save Changes")');
    
    // Check if the request appears in the table
    await expect(page.getByText('E2E Test Request').first()).toBeVisible();
    await expect(page.getByText('This is a test request created by Playwright.').first()).toBeVisible();
  });

  test('should filter requests by status', async ({ page }) => {
    // Select filter
    await page.click('text="All statuses"'); // Assuming this is the SelectTrigger text
    await page.click('[role="option"]:has-text("New")'); // Assuming SelectItem
    
    // Assuming the previously created request is Open
    await expect(page.getByText('E2E Test Request').first()).toBeVisible();
  });
});
