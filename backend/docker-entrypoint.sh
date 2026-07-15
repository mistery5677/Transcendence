#!/bin/sh
# backend/docker-entrypoint.sh
#
# Fetches JWT_SECRET and DATABASE_URL from HashiCorp Vault (KV v2, seeded by
# vault-init in plan 02-01) over Vault's raw HTTP API, exports them into the
# process environment, then execs the container's CMD (npm run start:dev) so
# Node inherits the exported vars. This is the ONLY place secrets are sourced
# from Vault — application code (getJwtSecret(), PrismaService) is unchanged
# and keeps reading process.env.
set -e

VAULT_ADDR="${VAULT_ADDR:-http://vault:8200}"
MAX_RETRIES=10

# fetch_secret <kv-v2 path without "data/">, e.g. backend/jwt
# Reads (KV v2, double /data/):
#   GET ${VAULT_ADDR}/v1/secret/data/backend/jwt  header X-Vault-Token
#   GET ${VAULT_ADDR}/v1/secret/data/backend/db   header X-Vault-Token
# Retries with a short sleep as defense-in-depth against a Vault/vault-init
# startup race, on top of docker-compose's service_completed_successfully gate.
fetch_secret() {
  path="$1"
  i=0
  while [ "$i" -lt "$MAX_RETRIES" ]; do
    result=$(wget -q --header="X-Vault-Token: ${VAULT_TOKEN}" -O - \
      "${VAULT_ADDR}/v1/secret/data/${path}" 2>/dev/null) && { printf '%s' "$result"; return 0; }
    i=$((i + 1))
    sleep 2
  done
  echo "Failed to fetch secret at ${path} from Vault after ${MAX_RETRIES} attempts" >&2
  exit 1
}

# json_field <json-string> <field-name-under-.data.data>
json_field() {
  node -e "const j=JSON.parse(process.argv[1]); process.stdout.write(j.data.data['$2'] ?? '')" "$1"
}

JWT_JSON=$(fetch_secret backend/jwt)
export JWT_SECRET
JWT_SECRET=$(json_field "$JWT_JSON" secret)

DB_JSON=$(fetch_secret backend/db)
DB_USER=$(json_field "$DB_JSON" user)
DB_PASSWORD=$(json_field "$DB_JSON" password)
DB_HOST=$(json_field "$DB_JSON" host)
DB_PORT=$(json_field "$DB_JSON" port)
DB_NAME=$(json_field "$DB_JSON" dbname)
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Apply pending DB migrations against the Vault-assembled DATABASE_URL before the
# app starts, so a clean volume (docker compose down -v) yields a fully-migrated
# schema unattended. `migrate deploy` is idempotent — on an already-migrated DB it
# is a no-op. Wait for Postgres to accept connections first (depends_on only gates
# on service_started, not readiness), then fail fast if migrations cannot apply.
i=0
until npx prisma migrate deploy; do
  i=$((i + 1))
  if [ "$i" -ge "$MAX_RETRIES" ]; then
    echo "Failed to apply Prisma migrations after ${MAX_RETRIES} attempts" >&2
    exit 1
  fi
  echo "prisma migrate deploy failed (attempt ${i}/${MAX_RETRIES}); retrying in 2s..." >&2
  sleep 2
done

exec "$@"
