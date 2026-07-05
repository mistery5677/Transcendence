#!/usr/bin/env bash
# scripts/verify-tls.sh
#
# Re-runnable smoke test proving Phase 4 end-to-end:
#   - HTTPS is reachable at the WAF (self-signed cert, TLS handshake succeeds)
#   - Plain HTTP redirects to HTTPS (301, no downgrade path)
#   - Legit signup/login still work over HTTPS
#   - The access_token cookie carries the Secure attribute on HTTPS login (TLS-02 proof)
#
# Reads WAF_PORT and WAF_SSL_PORT from .env.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env"

if [ ! -f "${ENV_FILE}" ]; then
  echo "FAIL: .env not found at ${ENV_FILE}"
  exit 1
fi

WAF_PORT="$(grep -E '^WAF_PORT=' "${ENV_FILE}" | tail -n1 | cut -d '=' -f2- | tr -d '[:space:]')"
WAF_SSL_PORT="$(grep -E '^WAF_SSL_PORT=' "${ENV_FILE}" | tail -n1 | cut -d '=' -f2- | tr -d '[:space:]')"

if [ -z "${WAF_PORT}" ]; then
  echo "FAIL: WAF_PORT not set in .env"
  exit 1
fi

if [ -z "${WAF_SSL_PORT}" ]; then
  echo "FAIL: WAF_SSL_PORT not set in .env"
  exit 1
fi

HTTPS_URL="https://localhost:${WAF_SSL_PORT}"
HTTP_URL="http://localhost:${WAF_PORT}"

FAILS=0
UNIQUE_SUFFIX="$(date +%s)"
TEST_EMAIL="tlstest+${UNIQUE_SUFFIX}@example.com"
TEST_USERNAME="tlstest${UNIQUE_SUFFIX}"
TEST_PASSWORD='Str0ng!Pass#123'

check_status() {
  # $1 = description, $2 = expected status, $3 = observed status
  local desc="$1"
  local expected="$2"
  local observed="$3"
  if [ "${observed}" = "${expected}" ]; then
    echo "PASS: ${desc} -> ${observed}"
  else
    echo "FAIL: ${desc} -> expected ${expected}, got ${observed}"
    FAILS=$((FAILS + 1))
  fi
}

# 1. HTTPS reachable -> 200
STATUS_1="$(curl -k -s -o /dev/null -w '%{http_code}' "${HTTPS_URL}/")"
check_status "1. HTTPS GET / (self-signed)" "200" "${STATUS_1}"

# 2. TLS handshake succeeds and presents a certificate
TLS_OUTPUT="$(openssl s_client -connect "localhost:${WAF_SSL_PORT}" </dev/null 2>&1)"
if printf '%s' "${TLS_OUTPUT}" | grep -qE 'BEGIN CERTIFICATE|Verify return code'; then
  echo "PASS: 2. TLS handshake presents a certificate"
else
  echo "FAIL: 2. TLS handshake did not present a certificate"
  FAILS=$((FAILS + 1))
fi

# 3. HTTP redirect -> 301 (do NOT follow, no -L)
STATUS_3="$(curl -s -o /dev/null -w '%{http_code}' "${HTTP_URL}/")"
check_status "3. HTTP GET / redirects (301)" "301" "${STATUS_3}"

# 4. Legit signup over HTTPS -> 201
STATUS_4="$(curl -k -s -o /dev/null -w '%{http_code}' -X POST "${HTTPS_URL}/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"username\":\"${TEST_USERNAME}\",\"password\":\"${TEST_PASSWORD}\",\"name\":\"TLS Test\"}")"
check_status "4. Legit signup over HTTPS" "201" "${STATUS_4}"

# 5. Legit login over HTTPS -> 200, capture headers
LOGIN_RESPONSE="$(curl -k -s -i -X POST "${HTTPS_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")"
STATUS_5="$(printf '%s' "${LOGIN_RESPONSE}" | head -n1 | grep -oE '[0-9]{3}')"
check_status "5. Legit login over HTTPS" "200" "${STATUS_5}"

# 6. Secure cookie: Set-Cookie: access_token=... must carry Secure (TLS-02 proof)
if printf '%s' "${LOGIN_RESPONSE}" | grep -Ei '^set-cookie:.*access_token' | grep -qi 'secure'; then
  echo "PASS: 6. Login Set-Cookie access_token carries Secure attribute"
else
  echo "FAIL: 6. Login Set-Cookie access_token missing Secure attribute"
  FAILS=$((FAILS + 1))
fi

echo ""
if [ "${FAILS}" -eq 0 ]; then
  echo "ALL CHECKS PASSED (HTTPS 200 + TLS handshake + HTTP 301 + signup 201 + login 200 + Secure cookie)"
  exit 0
else
  echo "FAILED: ${FAILS} assertion(s) did not match expected result"
  exit 1
fi
