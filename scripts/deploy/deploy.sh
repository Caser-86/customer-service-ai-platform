#!/bin/bash

# 智能客服系统生产环境部署脚本

set -e

echo "=== 智能客服系统生产环境部署 ==="

# 检查环境变量文件
if [ ! -f ".env.production" ]; then
    echo "错误: .env.production 文件不存在"
    echo "请复制 .env.production.example 并填写配置"
    exit 1
fi

# 加载环境变量
source .env.production

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

echo "✓ 环境变量检查通过"

# 停止现有服务
echo "停止现有服务..."
docker-compose -f docker-compose.prod.yml down

# 拉取最新代码
echo "拉取最新代码..."
git pull origin master

# 构建镜像
echo "构建 Docker 镜像..."
docker-compose -f docker-compose.prod.yml build

# 启动服务
echo "启动服务..."
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
echo "等待服务启动..."
sleep 30

# 检查服务状态
echo "检查服务状态..."
docker-compose -f docker-compose.prod.yml ps

# 运行健康检查
echo "运行健康检查..."
curl -f http://localhost:3001/api/health/ready || {
    echo "错误: API 健康检查失败"
    docker-compose -f docker-compose.prod.yml logs api
    exit 1
}

echo "✓ 部署完成!"
echo "API 地址: http://localhost:3001"
echo "Web 地址: http://localhost:3000"
echo "API 文档: http://localhost:3001/api/docs"
