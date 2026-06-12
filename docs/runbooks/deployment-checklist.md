# 生产环境部署清单

## 目录

1. [部署前准备](#部署前准备)
2. [服务器配置](#服务器配置)
3. [域名与 SSL](#域名与-ssl)
4. [数据库配置](#数据库配置)
5. [应用部署](#应用部署)
6. [负载均衡](#负载均衡)
7. [监控配置](#监控配置)
8. [备份配置](#备份配置)
9. [安全加固](#安全加固)
10. [上线检查](#上线检查)

## 部署前准备

### 代码准备

- [ ] 代码已推送到 GitHub
- [ ] 所有测试通过（单元测试、E2E 测试）
- [ ] 代码审查完成
- [ ] 版本号已更新
- [ ] 变更日志已更新

### 文档准备

- [ ] 用户手册已完成
- [ ] API 文档已完善
- [ ] 运维手册已编写
- [ ] 部署文档已编写

### 环境准备

- [ ] 生产环境服务器已准备
- [ ] 数据库服务器已准备
- [ ] Redis 服务器已准备
- [ ] MinIO 服务器已准备
- [ ] 域名已注册
- [ ] SSL 证书已申请

## 服务器配置

### 硬件要求

| 组件 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 2 核 | 4 核 |
| 内存 | 4 GB | 8 GB |
| 磁盘 | 50 GB SSD | 100 GB SSD |
| 网络 | 10 Mbps | 100 Mbps |

### 操作系统

- [ ] 操作系统：Ubuntu 22.04 LTS / CentOS 8
- [ ] 系统更新：`sudo apt update && sudo apt upgrade`
- [ ] 防火墙配置：只开放必要端口
- [ ] 时区设置：`sudo timedatectl set-timezone Asia/Shanghai`

### 基础软件

- [ ] Docker 安装：`curl -fsSL https://get.docker.com | sh`
- [ ] Docker Compose 安装：`sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`
- [ ] Git 安装：`sudo apt install git`
- [ ] Nginx 安装：`sudo apt install nginx`

### 用户配置

- [ ] 创建部署用户：`sudo useradd -m -s /bin/bash deploy`
- [ ] 添加到 docker 组：`sudo usermod -aG docker deploy`
- [ ] 配置 SSH 密钥登录
- [ ] 禁用密码登录

## 域名与 SSL

### 域名配置

- [ ] 域名已注册
- [ ] DNS 解析已配置
  - [ ] A 记录：`your-domain.com` → 服务器 IP
  - [ ] CNAME 记录：`www.your-domain.com` → `your-domain.com`
- [ ] DNS 生效验证：`nslookup your-domain.com`

### SSL 证书

- [ ] 申请 SSL 证书（Let's Encrypt）
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d your-domain.com -d www.your-domain.com
  ```
- [ ] 证书自动续期配置
  ```bash
  sudo certbot renew --dry-run
  ```
- [ ] HTTPS 强制跳转
  ```nginx
  server {
      listen 80;
      server_name your-domain.com www.your-domain.com;
      return 301 https://$server_name$request_uri;
  }
  ```

## 数据库配置

### PostgreSQL 配置

- [ ] 数据库创建
  ```sql
  CREATE DATABASE customer_service;
  CREATE USER cs_user WITH PASSWORD 'strong_password';
  GRANT ALL PRIVILEGES ON DATABASE customer_service TO cs_user;
  ```

- [ ] 连接池配置
  ```
  # postgresql.conf
  max_connections = 100
  shared_buffers = 2GB
  effective_cache_size = 6GB
  work_mem = 4MB
  ```

- [ ] 安全配置
  ```
  # pg_hba.conf
  host    all             all             10.0.0.0/8              md5
  host    all             all             172.16.0.0/12           md5
  host    all             all             192.168.0.0/16          md5
  ```

### Redis 配置

- [ ] Redis 安装
- [ ] 密码配置
  ```
  # redis.conf
  requirepass strong_password
  maxmemory 2gb
  maxmemory-policy allkeys-lru
  ```

### MinIO 配置

- [ ] MinIO 安装
- [ ] 访问密钥配置
- [ ] 存储桶创建

## 应用部署

### 环境变量

- [ ] 创建 `.env.production` 文件
- [ ] 配置所有必要的环境变量
- [ ] 验证环境变量

### Docker 部署

- [ ] 拉取代码
  ```bash
  git clone https://github.com/Caser-86/customer-service-ai-platform.git
  cd customer-service-ai-platform
  ```

- [ ] 构建镜像
  ```bash
  docker-compose -f docker-compose.prod.yml build
  ```

- [ ] 启动服务
  ```bash
  docker-compose -f docker-compose.prod.yml up -d
  ```

- [ ] 验证服务
  ```bash
  docker-compose -f docker-compose.prod.yml ps
  curl http://localhost:3001/api/health/ready
  ```

### 数据库迁移

- [ ] 运行数据库迁移
  ```bash
  docker exec cs-api npx prisma migrate deploy
  ```

- [ ] 初始化数据
  ```bash
  docker exec cs-api npx prisma db seed
  ```

## 负载均衡

### Nginx 配置

- [ ] 配置上游服务器
  ```nginx
  upstream api {
      server 127.0.0.1:3001;
  }
  
  upstream web {
      server 127.0.0.1:3000;
  }
  ```

- [ ] 配置 SSL
  ```nginx
  server {
      listen 443 ssl http2;
      server_name your-domain.com;
      
      ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
      
      location /api {
          proxy_pass http://api;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
      }
      
      location / {
          proxy_pass http://web;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
      }
  }
  ```

- [ ] 配置缓存
  ```nginx
  location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
  }
  ```

- [ ] 配置 Gzip
  ```nginx
  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;
  ```

## 监控配置

### 健康检查

- [ ] 配置健康检查端点
- [ ] 配置监控脚本
  ```bash
  #!/bin/bash
  curl -f http://localhost:3001/api/health/ready || exit 1
  ```

### 日志监控

- [ ] 配置日志收集
- [ ] 配置日志轮转
  ```
  # /etc/logrotate.d/customer-service
  /var/log/customer-service/*.log {
      daily
      missingok
      rotate 14
      compress
      delaycompress
      notifempty
      create 0640 deploy deploy
  }
  ```

### 性能监控

- [ ] 配置 Prometheus
- [ ] 配置 Grafana
- [ ] 配置告警规则

## 备份配置

### 数据库备份

- [ ] 配置自动备份
  ```bash
  # crontab
  0 2 * * * /path/to/scripts/backup/backup.sh
  ```

- [ ] 配置异地备份
- [ ] 测试恢复流程

### 文件备份

- [ ] 配置 MinIO 备份
  ```bash
  0 3 * * * /path/to/scripts/backup/backup-files.sh
  ```

## 安全加固

### 系统安全

- [ ] 配置防火墙
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```

- [ ] 禁用 root 登录
- [ ] 配置 fail2ban

### 应用安全

- [ ] 修改默认密码
- [ ] 配置速率限制
- [ ] 配置 CORS
- [ ] 配置安全头

### 网络安全

- [ ] 配置 VPN（如需要）
- [ ] 配置 DDoS 防护
- [ ] 配置 WAF（如需要）

## 上线检查

### 功能检查

- [ ] 用户注册/登录正常
- [ ] 访客对话正常
- [ ] 客服回复正常
- [ ] 管理后台正常
- [ ] 知识库管理正常
- [ ] 数据分析正常

### 性能检查

- [ ] 响应时间正常（< 500ms）
- [ ] 并发处理正常（> 100 并发）
- [ ] 资源使用正常（CPU < 80%，内存 < 80%）

### 安全检查

- [ ] HTTPS 正常
- [ ] 安全头正常
- [ ] 速率限制正常
- [ ] 输入验证正常

### 监控检查

- [ ] 健康检查正常
- [ ] 日志收集正常
- [ ] 告警配置正常

### 备份检查

- [ ] 备份脚本正常
- [ ] 恢复流程正常
- [ ] 异地备份正常

## 上线后监控

### 第一天

- [ ] 监控系统运行状态
- [ ] 监控错误日志
- [ ] 监控性能指标
- [ ] 收集用户反馈

### 第一周

- [ ] 分析使用数据
- [ ] 优化性能瓶颈
- [ ] 修复发现的问题
- [ ] 更新文档

### 第一个月

- [ ] 进行安全审计
- [ ] 进行性能测试
- [ ] 优化用户体验
- [ ] 规划后续迭代

## 应急响应

### 故障处理

- [ ] 制定故障处理流程
- [ ] 准备回滚方案
- [ ] 准备应急联系人

### 数据恢复

- [ ] 测试数据恢复流程
- [ ] 准备数据恢复文档
- [ ] 培训运维人员

## 文档更新

- [ ] 更新部署文档
- [ ] 更新运维手册
- [ ] 更新故障处理手册
- [ ] 培训相关人员
