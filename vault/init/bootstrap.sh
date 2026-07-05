#!/bin/sh
# vault-init entrypoint: seeds secrets into Vault's KV v2 engine.
# Idempotent: `vault kv put` overwrites the existing version on every run,
# so this script is safe to re-run on every `docker compose up`.
set -e

vault kv put secret/backend/jwt secret="$JWT_SECRET"

vault kv put secret/backend/db \
  user="$POSTGRES_USER" \
  password="$POSTGRES_PASSWORD" \
  host="database" \
  port="5432" \
  dbname="$POSTGRES_DB"

echo "Vault bootstrap complete."
