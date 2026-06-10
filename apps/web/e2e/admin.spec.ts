import { test, expect } from '@playwright/test';

test.describe('Admin Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/agent', { timeout: 10000 });
  });

  test('should display knowledge management page', async ({ page }) => {
    await page.goto('/admin/knowledge');
    await expect(page.locator('text=知识库管理')).toBeVisible();
    await expect(page.locator('text=上传文档')).toBeVisible();
  });

  test('should display bot settings page', async ({ page }) => {
    await page.goto('/admin/bot');
    await expect(page.locator('text=机器人配置')).toBeVisible();
    await expect(page.locator('text=模型设置')).toBeVisible();
  });

  test('should display team page', async ({ page }) => {
    await page.goto('/admin/team');
    await expect(page.locator('text=团队管理')).toBeVisible();
  });

  test('should display analytics page', async ({ page }) => {
    await page.goto('/admin/analytics');
    await expect(page.locator('text=报表分析')).toBeVisible();
  });

  test('should display audit page', async ({ page }) => {
    await page.goto('/admin/audit');
    await expect(page.locator('text=审计日志')).toBeVisible();
  });
});
