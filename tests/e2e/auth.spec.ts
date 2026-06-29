import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully with valid credentials and logout', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill in credentials
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Should see header or some element indicating logged in state
    await expect(page.getByText('Helpdesk Tracker')).toBeVisible();
    
    // Logout (button has lucide icon)
    await page.locator('button:has(svg.lucide-log-out)').click();
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="text"]', 'invaliduser');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    // Assuming there's a toast or error message
    // Just ensure we don't redirect
    await expect(page).toHaveURL('/login');
    // Sonner toast usually contains the error message
    await expect(page.locator('text="Invalid credentials"').first()).toBeVisible();
  });
});
