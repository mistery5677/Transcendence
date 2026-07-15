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

# Least-privilege: the backend must NOT use the root token. Define a policy that only
# grants READ on the KV v2 data paths under secret/backend/*, then mint a dedicated token
# carrying that policy. The backend authenticates with this token (VAULT_BACKEND_TOKEN)
# instead of VAULT_ROOT_TOKEN, so a leaked backend token cannot write secrets, reach other
# paths, or perform any privileged Vault operation.
vault policy write backend-read - <<'EOF'
path "secret/data/backend/*" {
  capabilities = ["read"]
}
EOF

# Create the token with a fixed ID (from .env) so docker-compose can hand it to the backend
# without a runtime handshake. Idempotent: revoke any pre-existing token with this ID first
# (safe no-op on a fresh Vault), then recreate it bound only to backend-read.
vault token revoke "$VAULT_BACKEND_TOKEN" 2>/dev/null || true
vault token create \
  -id="$VAULT_BACKEND_TOKEN" \
  -policy="backend-read" \
  -no-default-policy \
  -orphan \
  -period="768h" \
  -display-name="backend"

echo "Vault bootstrap complete."
