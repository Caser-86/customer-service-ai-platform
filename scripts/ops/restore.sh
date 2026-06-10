#!/bin/bash
# PostgreSQL Restore Script

BACKUP_FILE="$1"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-customer_service}"
DB_USER="${DB_USER:-postgres}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  echo "Example: $0 ./backups/backup_20260611_120000.sql.gz"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "WARNING: This will replace all data in $DB_NAME!"
read -p "Continue? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted"
  exit 0
echo "Restoring from $BACKUP_FILE..."

PGPASSWORD="$DB_PASSWORD" pg_restore \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --clean \
  --if-exists \
  "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Restore completed successfully"
else
  echo "Restore completed with warnings"
fi
