#!/bin/bash

# 智能客服系统数据库恢复脚本

set -e

BACKUP_DIR="./backups"

echo "=== 数据库恢复 ==="

# 检查备份文件
if [ -z "$1" ]; then
    echo "用法: $0 <备份文件>"
    echo "可用备份:"
    ls -lh "$BACKUP_DIR"/*.gz 2>/dev/null || echo "没有找到备份文件"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "错误: 备份文件不存在: $BACKUP_FILE"
    exit 1
fi

# 加载环境变量
if [ -f ".env.production" ]; then
    source .env.production
else
    echo "错误: .env.production 文件不存在"
    exit 1
fi

# 确认恢复操作
echo "警告: 此操作将覆盖当前数据库!"
echo "备份文件: $BACKUP_FILE"
read -p "确认继续? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "操作已取消"
    exit 0
fi

# 停止 API 服务
echo "停止 API 服务..."
docker-compose -f docker-compose.prod.yml stop api

# 解压备份文件
echo "解压备份文件..."
gunzip -k "$BACKUP_FILE"
SQL_FILE="${BACKUP_FILE%.gz}"

# 恢复数据库
echo "恢复数据库..."
docker exec -i cs-postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB" < "$SQL_FILE"

# 清理解压文件
rm -f "$SQL_FILE"

# 启动 API 服务
echo "启动 API 服务..."
docker-compose -f docker-compose.prod.yml start api

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 健康检查
echo "运行健康检查..."
curl -f http://localhost:3001/api/health/ready || {
    echo "错误: API 健康检查失败"
    docker-compose -f docker-compose.prod.yml logs api
    exit 1
}

echo "✓ 数据库恢复完成!"
