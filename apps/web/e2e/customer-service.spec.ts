// E2E 测试配置
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:3001';

// 测试用户凭据
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123';
const AGENT_EMAIL = 'agent@example.com';
const AGENT_PASSWORD = 'password123';

test.describe('智能客服系统 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前访问首页
    await page.goto(BASE_URL);
  });

  test('管理员登录', async ({ page }) => {
    // 访问登录页面
    await page.goto(`${BASE_URL}/admin/login`);
    
    // 填写登录表单
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    
    // 点击登录按钮
    await page.click('button[type="submit"]');
    
    // 等待登录成功
    await page.waitForURL('**/admin');
    
    // 验证登录成功
    await expect(page.locator('h1')).toContainText('管理后台');
  });

  test('客服登录', async ({ page }) => {
    // 访问登录页面
    await page.goto(`${BASE_URL}/agent/login`);
    
    // 填写登录表单
    await page.fill('input[name="email"]', AGENT_EMAIL);
    await page.fill('input[name="password"]', AGENT_PASSWORD);
    
    // 点击登录按钮
    await page.click('button[type="submit"]');
    
    // 等待登录成功
    await page.waitForURL('**/agent');
    
    // 验证登录成功
    await expect(page.locator('h1')).toContainText('客服工作台');
  });

  test('访客创建对话', async ({ page }) => {
    // 访问聊天页面
    await page.goto(`${BASE_URL}/chat`);
    
    // 填写访客信息
    await page.fill('input[name="name"]', '测试访客');
    await page.fill('input[name="email"]', 'test@example.com');
    
    // 点击开始对话按钮
    await page.click('button[type="submit"]');
    
    // 等待对话创建成功
    await page.waitForSelector('[data-testid="chat-window"]');
    
    // 验证对话窗口显示
    await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();
  });

  test('发送消息', async ({ page }) => {
    // 创建对话
    await page.goto(`${BASE_URL}/chat`);
    await page.fill('input[name="name"]', '测试访客');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="chat-window"]');
    
    // 发送消息
    await page.fill('textarea[data-testid="message-input"]', '你好，我需要帮助');
    await page.click('button[data-testid="send-button"]');
    
    // 等待消息发送成功
    await page.waitForSelector('[data-testid="message"][data-role="visitor"]');
    
    // 验证消息显示
    const message = page.locator('[data-testid="message"][data-role="visitor"]').first();
    await expect(message).toContainText('你好，我需要帮助');
  });

  test('AI 回复', async ({ page }) => {
    // 创建对话
    await page.goto(`${BASE_URL}/chat`);
    await page.fill('input[name="name"]', '测试访客');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="chat-window"]');
    
    // 发送消息
    await page.fill('textarea[data-testid="message-input"]', '你好');
    await page.click('button[data-testid="send-button"]');
    
    // 等待 AI 回复
    await page.waitForSelector('[data-testid="message"][data-role="ai"]', { timeout: 10000 });
    
    // 验证 AI 回复
    const aiMessage = page.locator('[data-testid="message"][data-role="ai"]').first();
    await expect(aiMessage).toBeVisible();
  });

  test('客服处理对话', async ({ page }) => {
    // 客服登录
    await page.goto(`${BASE_URL}/agent/login`);
    await page.fill('input[name="email"]', AGENT_EMAIL);
    await page.fill('input[name="password"]', AGENT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/agent');
    
    // 等待对话列表加载
    await page.waitForSelector('[data-testid="conversation-list"]');
    
    // 点击第一个对话
    await page.click('[data-testid="conversation-item"]');
    
    // 等待对话详情加载
    await page.waitForSelector('[data-testid="conversation-detail"]');
    
    // 发送回复
    await page.fill('textarea[data-testid="reply-input"]', '您好，我是客服小王');
    await page.click('button[data-testid="reply-button"]');
    
    // 等待回复发送成功
    await page.waitForSelector('[data-testid="message"][data-role="agent"]');
    
    // 验证回复显示
    const reply = page.locator('[data-testid="message"][data-role="agent"]').first();
    await expect(reply).toContainText('您好，我是客服小王');
  });

  test('管理后台 - 知识库管理', async ({ page }) => {
    // 管理员登录
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');
    
    // 访问知识库页面
    await page.goto(`${BASE_URL}/admin/knowledge`);
    
    // 等待页面加载
    await page.waitForSelector('[data-testid="knowledge-list"]');
    
    // 点击添加文档按钮
    await page.click('[data-testid="add-document-button"]');
    
    // 填写文档信息
    await page.fill('input[name="title"]', '测试文档');
    await page.fill('textarea[name="content"]', '这是测试文档内容');
    
    // 保存文档
    await page.click('button[data-testid="save-button"]');
    
    // 等待保存成功
    await page.waitForSelector('[data-testid="success-message"]');
    
    // 验证文档显示
    await expect(page.locator('[data-testid="document-item"]')).toContainText('测试文档');
  });

  test('管理后台 - 数据分析', async ({ page }) => {
    // 管理员登录
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');
    
    // 访问数据分析页面
    await page.goto(`${BASE_URL}/admin/analytics`);
    
    // 等待页面加载
    await page.waitForSelector('[data-testid="analytics-dashboard"]');
    
    // 验证统计卡片显示
    await expect(page.locator('[data-testid="total-conversations"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-resolution-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-handle-time"]')).toBeVisible();
  });

  test('管理后台 - 审计日志', async ({ page }) => {
    // 管理员登录
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');
    
    // 访问审计日志页面
    await page.goto(`${BASE_URL}/admin/audit`);
    
    // 等待页面加载
    await page.waitForSelector('[data-testid="audit-log-list"]');
    
    // 验证日志列表显示
    await expect(page.locator('[data-testid="audit-log-item"]').first()).toBeVisible();
  });

  test('健康检查', async ({ page }) => {
    // 访问健康检查接口
    const response = await page.goto(`${API_URL}/api/health/ready`);
    
    // 验证响应状态
    expect(response?.status()).toBe(200);
    
    // 验证响应内容
    const data = await response?.json();
    expect(data.status).toBe('ready');
    expect(data.checks.database).toBe('healthy');
    expect(data.checks.redis).toBe('healthy');
    expect(data.checks.minio).toBe('healthy');
  });
});
