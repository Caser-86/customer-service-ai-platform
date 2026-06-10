# 故障排查手册

## 服务健康检查

```bash
# API 健康检查
curl http://localhost:3001/api/health/ready

# 检查 Docker 服务状态
docker compose ps

# 查看服务日志
docker compose logs -f api
docker compose logs -f web
```

## 常见问题及解决方案

### 1. API 服务无法启动

**症状**: `curl http://localhost:3001/api/health/ready` 无响应

**排查步骤**:
```powershell
# 检查容器状态
docker compose ps api

# 查看容器日志
docker compose logs api

# 检查数据库连接
docker compose exec api npx prisma db push
```

**解决方案**:
- 确认 PostgreSQL 已启动: `docker compose ps postgres`
- 检查环境变量配置
- 重新构建: `docker compose up -d --build api`

### 2. 数据库连接失败

**症状**: API 日志显示 `Can't reach database server`

**排查步骤**:
```powershell
# 检查 PostgreSQL 状态
docker compose ps postgres

# 测试数据库连接
docker compose exec postgres psql -U postgres -d customer_service

# 检查数据库是否存在
docker compose exec postgres psql -U postgres -l
```

**解决方案**:
- 重启 PostgreSQL: `docker compose restart postgres`
- 重建数据库: `docker compose down -v && docker compose up -d postgres`
- 执行迁移: `cd apps/api && npx prisma migrate dev`

### 3. 前端无法访问

**症状**: `http://localhost` 无法打开

**排查步骤**:
```powershell
# 检查 Nginx 状态
docker compose ps nginx

# 检查 Web 服务状态
docker compose ps web

# 查看 Nginx 日志
docker compose logs nginx
```

**解决方案**:
- 确认所有服务已启动: `docker compose up -d`
- 检查端口冲突: `netstat -ano | findstr :80`
- 重启 Nginx: `docker compose restart nginx`

### 4. AI 回复异常

**症状**: 访客消息未收到 AI 回复

**排查步骤**:
```powershell
# 检查 API 日志
docker compose logs api | findstr "AI"

# 检查知识库状态
curl http://localhost:3001/api/admin/knowledge/documents -H "Authorization: Bearer <token>"
```

**解决方案**:
- 确认使用 Mock 模式: 检查 `.env` 中 `LLM_API_KEY` 是否为空
- 上传知识库文档
- 检查 AI 编排日志

### 5. 转人工功能异常

**症状**: 发送"人工"未触发转人工

**排查步骤**:
```powershell
# 检查会话状态
curl http://localhost:3001/api/agent/inbox -H "Authorization: Bearer <token>"

# 检查 Handoff 事件
docker compose exec postgres psql -U postgres -d customer_service -c "SELECT * FROM handoff_events;"
```

**解决方案**:
- 确认触发词正确: 人工、转人工、客服、投诉
- 检查 BotConfig 中的 handoffThreshold 设置
- 查看数据库中的 HandoffEvent 记录

## 日志查看

### Docker 日志

```powershell
# 查看所有服务日志
docker compose logs

# 实时查看特定服务
docker compose logs -f api
docker compose logs -f web

# 查看最近 100 行
docker compose logs --tail 100 api
```

### 应用日志

```powershell
# API 应用日志 (在容器内)
docker compose exec api cat /app/logs/app.log

# 查看审计日志
curl http://localhost:3001/api/admin/audit -H "Authorization: Bearer <token>"
```

## 数据恢复

### 数据库备份

```powershell
# 备份数据库
docker compose exec postgres pg_dump -U postgres customer_service > backup.sql

# 恢复数据库
docker compose exec -T postgres psql -U postgres customer_service < backup.sql
```

### 重置系统

```powershell
# 完全重置
docker compose down -v
docker compose up -d postgres redis minio
cd ../../apps/api
npx prisma migrate dev --name init
npx prisma db seed
```

## 性能问题

### 检查资源使用

```powershell
# Docker 资源使用
docker stats

# 检查容器资源限制
docker inspect cs-api | findstr "Memory"
```

### 优化建议

1. **数据库**: 添加适当的索引
2. **Redis**: 配置缓存策略
3. **API**: 启用请求压缩
4. **前端**: 启用静态资源缓存
