# 部署运行手册

## 前置要求

- Docker Desktop 或 Docker Engine
- Node.js 20+
- pnpm 9+
- Git

## 快速开始

### 一键部署

```powershell
.\deliver-intelligent-customer-service-platform.ps1 -Mode full -AiMode mock
```

### 分阶段部署

```powershell
# 1. 生成源码
.\deliver-intelligent-customer-service-platform.ps1 -Mode scaffold -AiMode mock

# 2. 安装依赖
.\deliver-intelligent-customer-service-platform.ps1 -Mode install -AiMode mock

# 3. 质量检查
.\deliver-intelligent-customer-service-platform.ps1 -Mode verify -AiMode mock

# 4. 部署服务
.\deliver-intelligent-customer-service-platform.ps1 -Mode deploy -AiMode mock

# 5. 验收测试
.\deliver-intelligent-customer-service-platform.ps1 -Mode acceptance -AiMode mock
```

## 手动部署

### 1. 启动基础设施

```powershell
cd customer-service-ai-platform/infra/docker
docker compose up -d postgres redis minio
```

### 2. 安装依赖

```powershell
cd customer-service-ai-platform
pnpm install
```

### 3. 数据库迁移

```powershell
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. 启动开发服务

```powershell
# 终端 1: API
cd apps/api
pnpm dev

# 终端 2: Web
cd apps/web
pnpm dev
```

### 5. 生产部署

```powershell
cd infra/docker
docker compose up -d --build
```

## 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| Nginx | 80 | 反向代理 |
| Web | 3000 | Next.js 前端 |
| API | 3001 | NestJS 后端 |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存 |
| MinIO | 9000/9001 | 文件存储 |

## 环境变量

复制 `.env.example` 为 `.env.local` 并配置：

```env
# 数据库
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/customer_service

# AI 配置 (可选)
LLM_API_KEY=your-api-key
LLM_API_BASE=https://api.openai.com/v1
LLM_MODEL=gpt-4
```

## 常见问题

### 端口被占用

```powershell
# 查找占用端口的进程
netstat -ano | findstr :80
netstat -ano | findstr :3001

# 终止进程
taskkill /PID <进程ID> /F
```

### Docker 服务启动失败

```powershell
# 查看日志
cd infra/docker
docker compose logs postgres
docker compose logs api

# 重启服务
docker compose restart
```

### 数据库连接失败

```powershell
# 检查 PostgreSQL 状态
docker compose ps postgres

# 重置数据库
docker compose down -v
docker compose up -d postgres
cd ../../apps/api
npx prisma migrate dev --name init
```
