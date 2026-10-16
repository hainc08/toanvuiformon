#!/usr/bin/env bash
# On-demand backup (e.g. before a risky change). Usage: ./scripts/backup-now.sh
set -euo pipefail
mkdir -p backups
OUT="backups/manual-$(date +%Y%m%d-%H%M%S).dump"
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' > "$OUT"
echo "Backup written to $OUT ($(du -h "$OUT" | cut -f1))"
