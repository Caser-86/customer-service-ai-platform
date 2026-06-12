# 安全测试指南

## 目录

1. [概述](#概述)
2. [测试工具](#测试工具)
3. [测试方法](#测试方法)
4. [测试清单](#测试清单)
5. [漏洞修复](#漏洞修复)
6. [安全最佳实践](#安全最佳实践)

## 概述

本文档描述智能客服系统的安全测试方法，包括认证测试、授权测试、输入验证测试、SQL 注入测试、XSS 测试等。

## 测试工具

### 推荐工具

1. **OWASP ZAP**：开源 Web 应用安全扫描器
2. **Burp Suite**：商业 Web 安全测试工具
3. **Nmap**：网络扫描工具
4. **SQLMap**：SQL 注入测试工具
5. **Postman**：API 测试工具

### 工具安装

```bash
# 安装 OWASP ZAP
docker run -it -p 8080:8080 owasp/zap2docker-stable

# 安装 SQLMap
pip install sqlmap

# 安装 Nmap
apt-get install nmap
```

## 测试方法

### 1. 认证测试

#### 测试目标

- 登录接口安全性
- Token 安全性
- 密码策略

#### 测试步骤

1. **暴力破解测试**
   ```bash
   # 使用 Hydra 测试暴力破解
   hydra -l admin@example.com -P /path/to/passwords.txt localhost http-post-form "/api/auth/login:email=^USER^&password=^PASS^:Invalid credentials"
   ```

2. **Token 安全性测试**
   ```bash
   # 测试 Token 是否可预测
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password123"}'
   
   # 多次登录，比较 Token
   ```

3. **密码策略测试**
   ```bash
   # 测试弱密码
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"123"}'
   ```

#### 预期结果

- 登录失败次数限制生效
- Token 不可预测
- 密码策略强制执行

### 2. 授权测试

#### 测试目标

- 权限控制
- 越权访问

#### 测试步骤

1. **水平越权测试**
   ```bash
   # 使用用户 A 的 Token 访问用户 B 的数据
   curl -X GET http://localhost:3001/api/auth/me \
     -H "Authorization: Bearer <user_a_token>"
   
   # 尝试访问其他用户的对话
   curl -X GET http://localhost:3001/api/agent/conversations/<other_user_conversation_id> \
     -H "Authorization: Bearer <user_a_token>"
   ```

2. **垂直越权测试**
   ```bash
   # 使用普通用户 Token 访问管理员接口
   curl -X GET http://localhost:3001/api/admin/knowledge/documents \
     -H "Authorization: Bearer <agent_token>"
   ```

#### 预期结果

- 水平越权被阻止
- 垂直越权被阻止

### 3. 输入验证测试

#### 测试目标

- SQL 注入
- XSS 攻击
- 命令注入

#### 测试步骤

1. **SQL 注入测试**
   ```bash
   # 使用 SQLMap 测试
   sqlmap -u "http://localhost:3001/api/auth/login" \
     --data="email=admin@example.com&password=password123" \
     --batch
   
   # 手动测试
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com'\'' OR 1=1--","password":"password123"}'
   ```

2. **XSS 测试**
   ```bash
   # 测试反射型 XSS
   curl -X POST http://localhost:3001/api/public/conversations \
     -H "Content-Type: application/json" \
     -d '{"tenantSlug":"default","name":"<script>alert(1)</script>","email":"test@example.com"}'
   
   # 测试存储型 XSS
   curl -X POST http://localhost:3001/api/public/conversations/<conversation_id>/messages \
     -H "Content-Type: application/json" \
     -H "x-visitor-token: <visitor_token>" \
     -d '{"content":"<script>alert(1)</script>"}'
   ```

3. **命令注入测试**
   ```bash
   # 测试文件上传
   curl -X POST http://localhost:3001/api/admin/knowledge/documents \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <admin_token>" \
     -d '{"title":"test; rm -rf /","content":"test"}'
   ```

#### 预期结果

- SQL 注入被阻止
- XSS 被阻止
- 命令注入被阻止

### 4. 会话管理测试

#### 测试目标

- 会话超时
- 会话固定

#### 测试步骤

1. **会话超时测试**
   ```bash
   # 登录获取 Token
   TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password123"}' | jq -r '.data.token')
   
   # 等待会话超时
   sleep 3600
   
   # 使用过期 Token
   curl -X GET http://localhost:3001/api/auth/me \
     -H "Authorization: Bearer $TOKEN"
   ```

2. **会话固定测试**
   ```bash
   # 登录前获取会话 ID
   SESSION_ID_BEFORE=$(curl -c cookies.txt http://localhost:3000 | grep session_id | awk '{print $NF}')
   
   # 登录
   curl -b cookies.txt -c cookies.txt -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password123"}'
   
   # 登录后获取会话 ID
   SESSION_ID_AFTER=$(curl -b cookies.txt http://localhost:3000 | grep session_id | awk '{print $NF}')
   
   # 比较会话 ID
   ```

#### 预期结果

- 会话超时生效
- 登录后会话 ID 改变

### 5. API 安全测试

#### 测试目标

- 速率限制
- CORS 配置
- HTTP 头安全

#### 测试步骤

1. **速率限制测试**
   ```bash
   # 快速发送大量请求
   for i in {1..200}; do
     curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"admin@example.com","password":"wrong"}' &
   done
   wait
   
   # 检查是否返回 429
   ```

2. **CORS 配置测试**
   ```bash
   # 测试跨域请求
   curl -X OPTIONS http://localhost:3001/api/auth/login \
     -H "Origin: http://evil.com" \
     -H "Access-Control-Request-Method: POST"
   ```

3. **HTTP 头安全测试**
   ```bash
   # 检查安全头
   curl -I http://localhost:3001/api/health/ready
   ```

#### 预期结果

- 速率限制生效
- CORS 配置正确
- 安全头存在

## 测试清单

### 认证测试

- [ ] 暴力破解防护
- [ ] Token 安全性
- [ ] 密码策略
- [ ] 登录失败锁定

### 授权测试

- [ ] 水平越权防护
- [ ] 垂直越权防护
- [ ] 权限最小化

### 输入验证测试

- [ ] SQL 注入防护
- [ ] XSS 防护
- [ ] 命令注入防护
- [ ] 文件上传安全

### 会话管理测试

- [ ] 会话超时
- [ ] 会话固定防护
- [ ] 会话注销

### API 安全测试

- [ ] 速率限制
- [ ] CORS 配置
- [ ] HTTP 头安全
- [ ] 错误信息泄露

### 数据安全测试

- [ ] 敏感数据加密
- [ ] 数据传输安全
- [ ] 数据存储安全

## 漏洞修复

### SQL 注入修复

```typescript
// 使用参数化查询
const user = await prisma.user.findUnique({
  where: { email: email },
});

// 避免字符串拼接
// 错误示例
const query = `SELECT * FROM users WHERE email = '${email}'`;

// 正确示例
const query = 'SELECT * FROM users WHERE email = $1';
const result = await prisma.$queryRaw`${query}`, [email];
```

### XSS 修复

```typescript
// 输出编码
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 使用 CSP 头
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

### 认证修复

```typescript
// 限制登录失败次数
@Injectable()
export class AuthGuard {
  private loginAttempts = new Map<string, number>();
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const email = request.body.email;
    
    const attempts = this.loginAttempts.get(email) || 0;
    if (attempts >= 5) {
      throw new UnauthorizedException('账户已锁定，请稍后再试');
    }
    
    // 验证逻辑...
    
    this.loginAttempts.set(email, 0);
    return true;
  }
}
```

## 安全最佳实践

### 开发阶段

1. **安全编码**
   - 使用参数化查询
   - 输入验证和输出编码
   - 最小权限原则

2. **依赖管理**
   - 定期更新依赖
   - 使用安全扫描工具
   - 审查第三方库

3. **代码审查**
   - 安全代码审查
   - 自动化安全扫描

### 测试阶段

1. **安全测试**
   - 定期进行安全测试
   - 自动化安全扫描
   - 渗透测试

2. **漏洞管理**
   - 漏洞跟踪
   - 及时修复
   - 验证修复

### 部署阶段

1. **安全配置**
   - 最小化服务
   - 安全头配置
   - HTTPS 强制

2. **监控告警**
   - 安全事件监控
   - 异常行为检测
   - 及时响应

3. **应急响应**
   - 安全事件响应计划
   - 数据泄露响应
   - 灾难恢复
