#!/bin/bash
# PostgreSQL Backup Script

BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-customer_service}"
DB_USER="${DB_USER:-postgres}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Starting backup of $DB_NAME..."

PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=custom \
  --compress=9 \
  -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup completed: $BACKUP_FILE"
  echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"
  
  # Clean up old backups (keep last 7)
  ls -t "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm
  echo "Old backups cleaned up"
else
  echo "Backup failed!"
  exit 1
fi
