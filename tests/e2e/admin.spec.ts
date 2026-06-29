import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test('should allow access for admin and display users', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Go to admin panel
    await page.goto('/admin');
    await expect(page).toHaveURL('/admin');
    
    // Should see users table
    await expect(page.getByText('User Management')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('admin').first()).toBeVisible();
  });

  test('should prevent access for non-admin users', async ({ page }) => {
    // First create a regular user by registering
    await page.goto('/register');
    const timestamp = Date.now();
    const testUsername = `user${timestamp}`;
    await page.fill('#username', testUsername);
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.click('button[type="submit"]');
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login');
    
    // Log in with new user
    await page.fill('input[type="text"]', testUsername);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Try to access admin panel
    await page.goto('/admin');
    
    // Should be redirected back to dashboard or see access denied
    // Based on route guards, it should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Clean up or just logout
    await page.locator('button:has(svg.lucide-log-out)').click();
  });
});
