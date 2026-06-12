#!/bin/bash

# 智能客服系统数据库备份脚本

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "=== 数据库备份 ==="

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 加载环境变量
if [ -f ".env.production" ]; then
    source .env.production
else
    echo "错误: .env.production 文件不存在"
    exit 1
fi

# 执行备份
echo "执行数据库备份..."
docker exec cs-postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_FILE"

# 压缩备份
echo "压缩备份文件..."
gzip "$BACKUP_FILE"

# 删除7天前的备份
echo "清理旧备份..."
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete

echo "✓ 备份完成: ${BACKUP_FILE}.gz"
echo "备份大小: $(du -h "${BACKUP_FILE}.gz" | cut -f1)"
