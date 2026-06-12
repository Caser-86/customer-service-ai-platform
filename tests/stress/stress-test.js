// 压力测试脚本
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// 自定义指标
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// 测试配置
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // 1 分钟内增加到 50 个用户
    { duration: '3m', target: 50 },   // 保持 50 个用户 3 分钟
    { duration: '1m', target: 100 },  // 1 分钟内增加到 100 个用户
    { duration: '3m', target: 100 },  // 保持 100 个用户 3 分钟
    { duration: '1m', target: 0 },    // 1 分钟内减少到 0 个用户
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% 的请求响应时间小于 500ms
    errors: ['rate<0.1'],              // 错误率小于 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// 测试数据
const testUsers = [
  { email: 'admin@example.com', password: 'password123' },
  { email: 'agent@example.com', password: 'password123' },
];

export default function () {
  // 随机选择测试用户
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // 1. 健康检查
  const healthResponse = http.get(`${BASE_URL}/api/health/ready`);
  check(healthResponse, {
    '健康检查成功': (r) => r.status === 200,
    '响应时间正常': (r) => r.timings.duration < 100,
  }) || errorRate.add(1);
  
  responseTime.add(healthResponse.timings.duration);
  
  // 2. 登录
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(loginResponse, {
    '登录成功': (r) => r.status === 200,
    '返回 token': (r) => r.json('data.token') !== undefined,
  }) || errorRate.add(1);
  
  responseTime.add(loginResponse.timings.duration);
  
  if (loginResponse.status !== 200) {
    sleep(1);
    return;
  }
  
  const token = loginResponse.json('data.token');
  
  // 3. 获取用户信息
  const meResponse = http.get(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  check(meResponse, {
    '获取用户信息成功': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  responseTime.add(meResponse.timings.duration);
  
  // 4. 创建对话
  const createConversationResponse = http.post(`${BASE_URL}/api/public/conversations`, JSON.stringify({
    tenantSlug: 'default',
    name: `测试用户 ${__VU}`,
    email: `test${__VU}@example.com`,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(createConversationResponse, {
    '创建对话成功': (r) => r.status === 200,
    '返回对话 ID': (r) => r.json('data.conversationId') !== undefined,
  }) || errorRate.add(1);
  
  responseTime.add(createConversationResponse.timings.duration);
  
  if (createConversationResponse.status !== 200) {
    sleep(1);
    return;
  }
  
  const conversationId = createConversationResponse.json('data.conversationId');
  const visitorToken = createConversationResponse.json('data.visitorToken');
  
  // 5. 发送消息
  const sendMessageResponse = http.post(
    `${BASE_URL}/api/public/conversations/${conversationId}/messages`,
    JSON.stringify({
      content: '你好，我需要帮助',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'x-visitor-token': visitorToken,
      },
    }
  );
  
  check(sendMessageResponse, {
    '发送消息成功': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  responseTime.add(sendMessageResponse.timings.duration);
  
  // 6. 获取收件箱（客服接口）
  if (user.email === 'agent@example.com') {
    const inboxResponse = http.get(`${BASE_URL}/api/agent/inbox`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    check(inboxResponse, {
      '获取收件箱成功': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    responseTime.add(inboxResponse.timings.duration);
  }
  
  // 7. 获取分析数据（管理员接口）
  if (user.email === 'admin@example.com') {
    const analyticsResponse = http.get(`${BASE_URL}/api/admin/analytics/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    check(analyticsResponse, {
      '获取分析数据成功': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    responseTime.add(analyticsResponse.timings.duration);
  }
  
  sleep(1);
}

// 测试开始前执行
export function setup() {
  console.log('开始压力测试...');
  console.log(`目标 URL: ${BASE_URL}`);
}

// 测试结束后执行
export function teardown(data) {
  console.log('压力测试完成');
}
