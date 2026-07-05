#!/usr/bin/env bash
# scripts/verify-legal.sh
#
# Re-runnable smoke test proving the Phase 5 gate end-to-end:
#   - /privacy and /terms are reachable through the WAF over HTTPS (SPA shell, 200)
#   - A previously un-validated endpoint (POST /api/stockfish/analyze) now rejects a
#     non-string `fen` body with a 4xx (VAL-01 remediation, plan 05-01)
#   - Malformed-email signup is still rejected with a 4xx (no-regression check)
#   - GET / (SPA root) still returns 200 (no-regression check)
#
# Reads WAF_SSL_PORT from .env and tests over HTTPS (curl -k, self-signed cert),
# mirroring scripts/verify-tls.sh and scripts/verify-waf.sh.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env"

if [ ! -f "${ENV_FILE}" ]; then
  echo "FAIL: .env not found at ${ENV_FILE}"
  exit 1
fi

WAF_SSL_PORT="$(grep -E '^WAF_SSL_PORT=' "${ENV_FILE}" | tail -n1 | cut -d '=' -f2- | tr -d '[:space:]')"

if [ -z "${WAF_SSL_PORT}" ]; then
  echo "FAIL: WAF_SSL_PORT not set in .env"
  exit 1
fi

WAF_URL="https://localhost:${WAF_SSL_PORT}"

FAILS=0
UNIQUE_SUFFIX="$(date +%s)"

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

check_4xx() {
  # $1 = description, $2 = observed status
  local desc="$1"
  local observed="$2"
  if printf '%s' "${observed}" | grep -qE '^4[0-9]{2}$'; then
    echo "PASS: ${desc} -> ${observed}"
  else
    echo "FAIL: ${desc} -> expected 4xx, got ${observed}"
    FAILS=$((FAILS + 1))
  fi
}

# 1. GET /privacy -> 200 (SPA shell, client-side route)
STATUS_1="$(curl -k -s -o /dev/null -w '%{http_code}' "${WAF_URL}/privacy")"
check_status "1. GET /privacy (legal page, LEGAL-01)" "200" "${STATUS_1}"

# 2. GET /terms -> 200 (SPA shell, client-side route)
STATUS_2="$(curl -k -s -o /dev/null -w '%{http_code}' "${WAF_URL}/terms")"
check_status "2. GET /terms (legal page, LEGAL-02)" "200" "${STATUS_2}"

# 3. POST /api/stockfish/analyze with non-string fen -> 4xx (VAL-01 remediation,
#    newly-fixed endpoint that previously accepted this body via a plain TS type)
STATUS_3="$(curl -k -s -o /dev/null -w '%{http_code}' -X POST "${WAF_URL}/api/stockfish/analyze" \
  -H "Content-Type: application/json" \
  -d '{"fen": 12345}')"
check_4xx "3. POST /api/stockfish/analyze non-string fen (VAL-01, newly-fixed endpoint)" "${STATUS_3}"

# 4. POST /api/auth/signup with malformed email -> 4xx (general no-regression check)
STATUS_4="$(curl -k -s -o /dev/null -w '%{http_code}' -X POST "${WAF_URL}/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"not-an-email\",\"username\":\"legaltest${UNIQUE_SUFFIX}\",\"password\":\"Str0ng!Pass#123\",\"name\":\"Legal Test\"}")"
check_4xx "4. POST /api/auth/signup malformed email (no-regression)" "${STATUS_4}"

# 5. GET / (SPA root) -> 200 (no-regression check)
STATUS_5="$(curl -k -s -o /dev/null -w '%{http_code}' "${WAF_URL}/")"
check_status "5. GET / (SPA root, no-regression)" "200" "${STATUS_5}"

echo ""
if [ "${FAILS}" -eq 0 ]; then
  echo "ALL CHECKS PASSED (privacy 200 + terms 200 + stockfish analyze 4xx + signup 4xx + / 200)"
  exit 0
else
  echo "FAILED: ${FAILS} assertion(s) did not match expected result"
  exit 1
fi
