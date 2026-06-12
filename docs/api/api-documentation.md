# API 文档

## 目录

1. [概述](#概述)
2. [认证](#认证)
3. [访客接口](#访客接口)
4. [客服接口](#客服接口)
5. [管理员接口](#管理员接口)
6. [健康检查接口](#健康检查接口)
7. [错误码](#错误码)

## 概述

智能客服系统提供 RESTful API，支持以下功能：

- **认证**：用户登录、Token 管理
- **访客接口**：创建对话、发送消息
- **客服接口**：处理对话、管理工单
- **管理员接口**：知识库管理、系统配置
- **健康检查**：系统状态监控

### 基础信息

- **Base URL**: `https://your-domain.com/api`
- **认证方式**: Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 请求头

所有请求需要包含以下头信息：

```
Content-Type: application/json
Authorization: Bearer <token>
```

### 响应格式

所有响应格式如下：

```json
{
  "ok": true,
  "data": { ... },
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

## 认证

### 登录

**POST** `/auth/login`

请求体：

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

响应：

```json
{
  "ok": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "email": "admin@example.com",
      "name": "Admin",
      "roles": ["admin"]
    }
  }
}
```

### 获取当前用户

**GET** `/auth/me`

响应：

```json
{
  "ok": true,
  "data": {
    "id": "user-123",
    "email": "admin@example.com",
    "name": "Admin",
    "roles": ["admin"]
  }
}
```

## 访客接口

### 创建对话

**POST** `/public/conversations`

请求体：

```json
{
  "tenantSlug": "default",
  "name": "访客姓名",
  "email": "visitor@example.com"
}
```

响应：

```json
{
  "ok": true,
  "data": {
    "conversationId": "conv-123",
    "visitorToken": "eyJ2aXNpdG9ySWQiOiJ2aXNpdG9yLTEyMyJ9...",
    "visitor": {
      "id": "visitor-123",
      "name": "访客姓名",
      "email": "visitor@example.com"
    }
  }
}
```

### 发送消息

**POST** `/public/conversations/{conversationId}/messages`

请求头：

```
x-visitor-token: <visitorToken>
```

请求体：

```json
{
  "content": "你好，我需要帮助"
}
```

响应：

```json
{
  "ok": true,
  "data": {
    "messageId": "msg-123",
    "content": "你好，我需要帮助",
    "role": "visitor",
    "createdAt": "2026-06-12T12:00:00Z"
  }
}
```

## 客服接口

### 获取收件箱

**GET** `/agent/inbox`

响应：

```json
{
  "ok": true,
  "data": {
    "pending": [
      {
        "id": "conv-123",
        "visitorName": "访客姓名",
        "lastMessage": "你好，我需要帮助",
        "createdAt": "2026-06-12T12:00:00Z"
      }
    ],
    "active": [
      {
        "id": "conv-456",
        "visitorName": "另一个访客",
        "lastMessage": "谢谢你的帮助",
        "assignedAt": "2026-06-12T12:05:00Z"
      }
    ]
  }
}
```

### 认领对话

**POST** `/agent/conversations/{conversationId}/claim`

响应：

```json
{
  "ok": true,
  "data": {
    "conversationId": "conv-123",
    "status": "assigned"
  }
}
```

### 回复对话

**POST** `/agent/conversations/{conversationId}/reply`

请求体：

```json
{
  "content": "您好，我是客服小王，很高兴为您服务。"
}
```

响应：

```json
{
  "ok": true,
  "data": {
    "messageId": "msg-789",
    "content": "您好，我是客服小王，很高兴为您服务。",
    "role": "agent",
    "createdAt": "2026-06-12T12:10:00Z"
  }
}
```

### 关闭对话

**POST** `/agent/conversations/{conversationId}/close`

响应：

```json
{
  "ok": true,
  "data": {
    "conversationId": "conv-123",
    "status": "resolved"
  }
}
```

### 创建工单

**POST** `/agent/conversations/{conversationId}/tickets`

请求体：

```json
{
  "title": "退款申请",
  "description": "用户申请退款，需要财务部门处理",
  "priority": "high"
}
```

响应：

```json
{
  "ok": true,
  "data": {
    "ticketId": "ticket-123",
    "title": "退款申请",
    "status": "open",
    "priority": "high",
    "createdAt": "2026-06-12T12:15:00Z"
  }
}
```

## 管理员接口

### 上传知识库文档

**POST** `/admin/knowledge/documents`

请求体：

```json
{
  "title": "退款政策",
  "content": "我们的退款政策如下...",
  "sourceType": "policy"
}
```

响应：

```json
{
  "ok": true,
  "data": {
    "documentId": "doc-123",
    "title": "退款政策",
    "status": "indexed"
  }
}
```

### 获取知识库文档列表

**GET** `/admin/knowledge/documents`

响应：

```json
{
  "ok": true,
  "data": {
    "documents": [
      {
        "id": "doc-123",
        "title": "退款政策",
        "sourceType": "policy",
        "createdAt": "2026-06-12T12:00:00Z"
      }
    ],
    "total": 1
  }
}
```

### 重建知识库索引

**POST** `/admin/knowledge/reindex`

响应：

```json
{
  "ok": true,
  "data": {
    "status": "reindexing",
    "estimatedTime": "1-5 分钟"
  }
}
```

### 获取分析数据

**GET** `/admin/analytics/overview`

响应：

```json
{
  "ok": true,
  "data": {
    "totalConversations": 100,
    "aiResolutionRate": 0.75,
    "averageHandleTime": 300,
    "satisfactionScore": 4.5
  }
}
```

### 获取审计日志

**GET** `/admin/audit?page=1&limit=50`

响应：

```json
{
  "ok": true,
  "data": {
    "logs": [
      {
        "id": "log-123",
        "action": "user.login",
        "userId": "user-123",
        "details": { ... },
        "createdAt": "2026-06-12T12:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 50
  }
}
```

### 更新机器人配置

**POST** `/admin/bot/config`

请求体：

```json
{
  "provider": "openai",
  "model": "gpt-4",
  "handoffThreshold": 0.7
}
```

响应：

```json
{
  "ok": true,
  "data": {
    "provider": "openai",
    "model": "gpt-4",
    "handoffThreshold": 0.7
  }
}
```

### 获取团队成员

**GET** `/admin/team`

响应：

```json
{
  "ok": true,
  "data": {
    "members": [
      {
        "id": "user-123",
        "name": "客服小王",
        "email": "agent@example.com",
        "roles": ["agent"],
        "status": "online"
      }
    ]
  }
}
```

## 健康检查接口

### 健康检查

**GET** `/health/ready`

响应：

```json
{
  "status": "ready",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "minio": "healthy"
  },
  "timestamp": "2026-06-12T12:00:00Z"
}
```

## 错误码

| 错误码 | 描述 | HTTP 状态码 |
|--------|------|------------|
| `VALIDATION_ERROR` | 请求参数验证失败 | 400 |
| `UNAUTHORIZED` | 未认证 | 401 |
| `FORBIDDEN` | 无权限 | 403 |
| `NOT_FOUND` | 资源不存在 | 404 |
| `CONFLICT` | 资源冲突 | 409 |
| `RATE_LIMITED` | 请求过于频繁 | 429 |
| `INTERNAL_ERROR` | 服务器内部错误 | 500 |

### 错误响应示例

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "邮箱格式不正确",
    "details": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      }
    ]
  }
}
```

## 速率限制

API 实施速率限制：

- **默认限制**：100 次/分钟
- **认证接口**：10 次/分钟
- **访客接口**：30 次/分钟

超出限制会返回 `429 Too Many Requests` 状态码。

## 版本控制

API 版本通过 URL 路径控制：

- **当前版本**：`/api/v1`
- **默认版本**：`/api`（等同于 `/api/v1`）

## 示例代码

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE = 'https://your-domain.com/api';
const TOKEN = 'your-jwt-token';

// 创建对话
async function createConversation() {
  const response = await axios.post(`${API_BASE}/public/conversations`, {
    tenantSlug: 'default',
    name: '访客姓名',
    email: 'visitor@example.com'
  });
  return response.data;
}

// 发送消息
async function sendMessage(conversationId, visitorToken, content) {
  const response = await axios.post(
    `${API_BASE}/public/conversations/${conversationId}/messages`,
    { content },
    { headers: { 'x-visitor-token': visitorToken } }
  );
  return response.data;
}

// 获取收件箱
async function getInbox() {
  const response = await axios.get(`${API_BASE}/agent/inbox`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  return response.data;
}
```

### Python

```python
import requests

API_BASE = 'https://your-domain.com/api'
TOKEN = 'your-jwt-token'

# 创建对话
def create_conversation():
    response = requests.post(f'{API_BASE}/public/conversations', json={
        'tenantSlug': 'default',
        'name': '访客姓名',
        'email': 'visitor@example.com'
    })
    return response.json()

# 发送消息
def send_message(conversation_id, visitor_token, content):
    response = requests.post(
        f'{API_BASE}/public/conversations/{conversation_id}/messages',
        json={'content': content},
        headers={'x-visitor-token': visitor_token}
    )
    return response.json()

# 获取收件箱
def get_inbox():
    response = requests.get(f'{API_BASE}/agent/inbox', headers={
        'Authorization': f'Bearer {TOKEN}'
    })
    return response.json()
```

## 调试工具

### Swagger UI

访问 `https://your-domain.com/api/docs` 使用 Swagger UI 测试 API。

### Postman

可以导入 OpenAPI 规范文件到 Postman 中测试 API。

### curl 示例

```bash
# 登录
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# 创建对话
curl -X POST https://your-domain.com/api/public/conversations \
  -H "Content-Type: application/json" \
  -d '{"tenantSlug":"default","name":"访客姓名","email":"visitor@example.com"}'
```
