import { test, expect } from '@playwright/test';

test.describe('Chat Page', () => {
  test('should display chat interface', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.locator('text=在线客服')).toBeVisible();
    await expect(page.locator('input[placeholder="输入您的问题..."]')).toBeVisible();
    await expect(page.locator('button:has-text("发送")')).toBeVisible();
  });

  test('should send message and receive AI response', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForTimeout(2000);
    
    const input = page.locator('input[placeholder="输入您的问题..."]');
    await input.fill('怎么申请退款？');
    await page.click('button:has-text("发送")');
    
    await expect(page.locator('text=退款')).toBeVisible({ timeout: 15000 });
  });
});
