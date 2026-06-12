#!/bin/bash

# 智能客服系统生产环境部署脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=== 智能客服系统生产环境部署 ==="

# 检查环境变量文件
if [ ! -f "$PROJECT_ROOT/infra/docker/.env.production" ]; then
    echo "错误: .env.production 文件不存在"
    echo "请复制 .env.production.example 并填写配置"
    exit 1
fi

# 加载环境变量
source "$PROJECT_ROOT/infra/docker/.env.production"

# 检查必要的环境变量
required_vars=(
    "JWT_SECRET"
    "VISITOR_TOKEN_SECRET"
    "POSTGRES_USER"
    "POSTGRES_PASSWORD"
    "POSTGRES_DB"
    "MINIO_ROOT_USER"
    "MINIO_ROOT_PASSWORD"
    "CORS_ORIGIN"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "错误: 环境变量 $var 未设置"
        exit 1
    fi
done

# 检查占位符值
placeholder_values=(
    "your-super-secret-jwt-key-at-least-32-chars"
    "your-visitor-token-secret-at-least-32-chars"
    "your-strong-database-password"
    "your-strong-minio-password"
)

for placeholder in "${placeholder_values[@]}"; do
    if [ "$JWT_SECRET" = "$placeholder" ] || [ "$VISITOR_TOKEN_SECRET" = "$placeholder" ] || [ "$POSTGRES_PASSWORD" = "$placeholder" ] || [ "$MINIO_ROOT_PASSWORD" = "$placeholder" ]; then
        echo "错误: 检测到占位符密钥值，请使用真实的密钥"
        echo "运行以下命令生成安全密钥:"
        echo "  JWT_SECRET=\$(openssl rand -base64 32)"
        echo "  VISITOR_TOKEN_SECRET=\$(openssl rand -base64 32)"
        exit 1
    fi
done

echo "✓ 环境变量检查通过"

# 停止现有服务
echo "停止现有服务..."
docker-compose -f "$PROJECT_ROOT/infra/docker/docker-compose.prod.yml" down

# 拉取最新代码
echo "拉取最新代码..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
git pull origin "$CURRENT_BRANCH"

# 构建镜像
echo "构建 Docker 镜像..."
docker-compose -f "$PROJECT_ROOT/infra/docker/docker-compose.prod.yml" build

# 启动服务
echo "启动服务..."
docker-compose -f "$PROJECT_ROOT/infra/docker/docker-compose.prod.yml" up -d

# 等待服务启动
echo "等待服务启动..."
sleep 30

# 检查服务状态
echo "检查服务状态..."
docker-compose -f "$PROJECT_ROOT/infra/docker/docker-compose.prod.yml" ps

# 运行健康检查
echo "运行健康检查..."
curl -f http://localhost:3001/api/health/ready || {
    echo "错误: API 健康检查失败"
    docker-compose -f "$PROJECT_ROOT/infra/docker/docker-compose.prod.yml" logs api
    exit 1
}

echo "✓ 部署完成!"
echo "API 地址: https://localhost:3001"
echo "Web 地址: https://localhost:3000"
echo "健康检查: https://localhost/api/health/ready"
echo ""
echo "注意: 如使用自签名证书，浏览器会显示安全警告"
echo "生产环境请使用受信任的 SSL 证书"
