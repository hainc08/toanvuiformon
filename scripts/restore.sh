#!/usr/bin/env bash
# Restore a pg_dump (custom format) into the production database.
# Usage (on the VPS, in the project directory):  ./scripts/restore.sh backups/daily-20261016-030000.dump
# The app is stopped during restore and a fresh safety dump is taken first.
set -euo pipefail
FILE="${1:?Usage: restore.sh <backup.dump>}"
[ -f "$FILE" ] || { echo "File not found: $FILE"; exit 1; }
read -r -p "Restore '$FILE' over the CURRENT production database? Type RESTORE to continue: " ok
[ "$ok" = "RESTORE" ] || { echo "Aborted"; exit 1; }

docker compose stop app
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' > "backups/before-restore-$(date +%Y%m%d-%H%M%S).dump"
docker compose exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < "$FILE"
docker compose start app
echo "Restore finished. Check: curl -fsS https://\$DOMAIN/api/health"
