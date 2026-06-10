import { test, expect } from '@playwright/test';

test.describe('Agent Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'agent@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/agent', { timeout: 10000 });
  });

  test('should display agent workspace', async ({ page }) => {
    await expect(page.locator('text=待处理会话')).toBeVisible();
    await expect(page.locator('text=选择一个会话开始处理')).toBeVisible();
  });
});
