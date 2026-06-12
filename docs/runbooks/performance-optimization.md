# 性能优化指南

## 目录

1. [概述](#概述)
2. [数据库优化](#数据库优化)
3. [API 缓存](#api-缓存)
4. [前端优化](#前端优化)
5. [服务器优化](#服务器优化)
6. [监控与调优](#监控与调优)

## 概述

本文档描述智能客服系统的性能优化策略，包括数据库优化、API 缓存、前端优化和服务器优化。

## 数据库优化

### 索引优化

#### 已创建的索引

系统已为常用查询创建索引：

```sql
-- 用户表索引
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- 对话表索引
CREATE INDEX idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

-- 消息表索引
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

#### 索引使用监控

```sql
-- 查看索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

#### 索引优化建议

1. **定期分析查询计划**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM conversations WHERE tenant_id = 'xxx' AND status = 'open';
   ```

2. **识别未使用的索引**
   ```sql
   SELECT 
       schemaname,
       tablename,
       indexname,
       idx_scan
   FROM pg_stat_user_indexes
   WHERE idx_scan = 0;
   ```

3. **重建碎片化索引**
   ```sql
   REINDEX INDEX idx_conversations_tenant_id;
   ```

### 查询优化

#### 慢查询监控

```sql
-- 启用慢查询日志
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1秒
SELECT pg_reload_conf();
```

#### 查询优化技巧

1. **使用 EXPLAIN ANALYZE**
   ```sql
   EXPLAIN ANALYZE 
   SELECT c.*, v.name as visitor_name
   FROM conversations c
   JOIN visitors v ON c.visitor_id = v.id
   WHERE c.tenant_id = 'xxx'
   ORDER BY c.created_at DESC
   LIMIT 20;
   ```

2. **避免 SELECT ***
   ```sql
   -- 不推荐
   SELECT * FROM conversations;
   
   -- 推荐
   SELECT id, status, created_at FROM conversations;
   ```

3. **使用分页**
   ```sql
   -- 使用游标分页
   SELECT * FROM conversations
   WHERE id > 'last_id'
   ORDER BY id
   LIMIT 20;
   ```

### 连接池配置

#### Prisma 连接池

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 连接池参数

```env
# .env.production
DATABASE_URL=postgresql://user:password@host:5432/db?connection_limit=20&pool_timeout=30
```

## API 缓存

### Redis 缓存策略

#### 缓存场景

1. **会话缓存**：缓存用户会话信息
2. **数据缓存**：缓存频繁查询的数据
3. **页面缓存**：缓存静态页面

#### 缓存实现

```typescript
// 缓存服务示例
@Injectable()
export class CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
```

#### 缓存键设计

```
# 用户信息
user:{userId}

# 对话信息
conversation:{conversationId}

# 知识库文档
knowledge:{tenantId}:{documentId}

# 分析数据
analytics:{tenantId}:{date}
```

### HTTP 缓存

#### 缓存头配置

```typescript
// 设置缓存头
app.use((req, res, next) => {
  // 静态资源缓存
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  
  // API 缓存
  if (req.url.startsWith('/api/health')) {
    res.setHeader('Cache-Control', 'public, max-age=10');
  }
  
  next();
});
```

## 前端优化

### 资源压缩

#### Webpack 配置

```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  
  // 图片优化
  images: {
    domains: ['your-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // 代码分割
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};
```

### 懒加载

#### 组件懒加载

```typescript
// 动态导入
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});
```

#### 图片懒加载

```typescript
// 使用 next/image
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  loading="lazy"
/>
```

### 代码分割

#### 路由分割

```typescript
// 按路由分割
const routes = {
  '/': () => import('./pages/Home'),
  '/admin': () => import('./pages/Admin'),
  '/agent': () => import('./pages/Agent'),
};
```

## 服务器优化

### Nginx 配置

#### Gzip 压缩

```nginx
# nginx.conf
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;
```

#### 缓存配置

```nginx
# 静态资源缓存
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# API 缓存
location /api/health {
    expires 10s;
    add_header Cache-Control "public";
}
```

### Docker 优化

#### 多阶段构建

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["node", "dist/main"]
```

#### 资源限制

```yaml
# docker-compose.prod.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1'
```

## 监控与调优

### 性能监控

#### 关键指标

1. **响应时间**：API 平均响应时间
2. **吞吐量**：每秒请求数 (RPS)
3. **错误率**：错误请求比例
4. **资源使用**：CPU、内存、磁盘使用率

#### 监控工具

- **Prometheus**：指标收集
- **Grafana**：可视化监控
- **New Relic**：APM 监控

### 性能测试

#### 压力测试

```bash
# 使用 k6 进行压力测试
k6 run --vus 100 --duration 30s stress-test.js
```

#### 负载测试

```bash
# 使用 Apache Bench
ab -n 1000 -c 10 http://localhost:3001/api/health/ready
```

### 调优建议

#### 数据库调优

1. **调整 shared_buffers**：设置为内存的 25%
2. **调整 work_mem**：根据查询复杂度调整
3. **调整 effective_cache_size**：设置为内存的 75%

#### 应用调优

1. **启用连接池**：使用 Prisma 连接池
2. **优化查询**：避免 N+1 查询
3. **使用缓存**：Redis 缓存频繁数据

#### 服务器调优

1. **调整文件描述符限制**：增加 ulimit
2. **优化网络参数**：调整 TCP 参数
3. **使用 SSD**：提高磁盘 I/O 性能

## 最佳实践

### 开发阶段

1. **使用 EXPLAIN ANALYZE**：分析查询性能
2. **避免 N+1 查询**：使用 JOIN 或预加载
3. **使用分页**：避免一次性加载大量数据
4. **压缩响应**：启用 Gzip 压缩

### 测试阶段

1. **性能测试**：定期进行压力测试
2. **监控告警**：设置性能告警阈值
3. **基线对比**：建立性能基线

### 生产阶段

1. **监控指标**：持续监控关键指标
2. **容量规划**：根据使用情况规划容量
3. **优化迭代**：持续优化性能瓶颈
