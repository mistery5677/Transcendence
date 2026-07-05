#!/usr/bin/env bash
# scripts/verify-waf.sh
#
# Re-runnable smoke test proving the whole Phase 3 goal end-to-end:
#   - SQLi, XSS, path-traversal, and scanner-UA payloads are blocked (403) by the WAF
#   - Legitimate signup/login/SPA traffic passes through the WAF untouched
#
# Reads WAF_SSL_PORT from .env and tests over HTTPS (curl -k, self-signed cert).
#
# NOTE (Phase 4 / plan 04-03): since Plan 04-01 enabled NGINX_ALWAYS_TLS_REDIRECT, plain
# HTTP now unconditionally 301-redirects at nginx's rewrite phase, which runs BEFORE
# ModSecurity's access-phase inspection — so testing over http://${WAF_PORT} no longer
# exercises CRS at all (every payload just returns 301, never reaching the backend or the
# WAF rule engine). HTTPS is now the real enforcement point where CRS actually runs, so
# this script targets https://${WAF_SSL_PORT} instead. Verified live: CRS still blocks all
# four attack classes (403) and still passes legit signup/login/SPA traffic over HTTPS —
# no actual CRS regression from adding the SSL block (threat T-04-05).

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
TEST_EMAIL="waftest+${UNIQUE_SUFFIX}@example.com"
TEST_USERNAME="waftest${UNIQUE_SUFFIX}"
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

# 1. SQLi in query param -> 403 (rule 942100)
STATUS_1="$(curl -k -s -o /dev/null -w '%{http_code}' "${WAF_URL}/api/users/check-username?username=1%27%20OR%20%271%27%3D%271")"
check_status "1. SQLi query param (942100)" "403" "${STATUS_1}"

# 2. XSS in query param -> 403 (rule 941100)
STATUS_2="$(curl -k -s -o /dev/null -w '%{http_code}' "${WAF_URL}/?x=<script>alert(1)</script>")"
check_status "2. XSS query param (941100)" "403" "${STATUS_2}"

# 3. Path traversal in QUERY STRING (not raw path — Pitfall 4) -> 403 (9301xx)
STATUS_3="$(curl -k -s -o /dev/null -w '%{http_code}' "${WAF_URL}/api/users/check-username?username=../../../../etc/passwd")"
check_status "3. Path traversal in query string (9301xx)" "403" "${STATUS_3}"

# 4. Scanner UA -> 403 (rule 913100)
STATUS_4="$(curl -k -s -o /dev/null -w '%{http_code}' -A "sqlmap/1.7" "${WAF_URL}/api/users/check-username?username=test")"
check_status "4. Scanner User-Agent sqlmap/1.7 (913100)" "403" "${STATUS_4}"

# 5. Legit signup POST (JSON) -> 201, must NOT be blocked
STATUS_5="$(curl -k -s -o /dev/null -w '%{http_code}' -X POST "${WAF_URL}/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"username\":\"${TEST_USERNAME}\",\"password\":\"${TEST_PASSWORD}\",\"name\":\"WAF Test\"}")"
check_status "5. Legit signup (must NOT block)" "201" "${STATUS_5}"

# 6. Legit login POST (JSON) -> 200 + Set-Cookie: access_token, must NOT be blocked
LOGIN_RESPONSE="$(curl -k -s -i -X POST "${WAF_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")"
STATUS_6="$(printf '%s' "${LOGIN_RESPONSE}" | head -n1 | grep -oE '[0-9]{3}')"
check_status "6. Legit login (must NOT block)" "200" "${STATUS_6}"

if printf '%s' "${LOGIN_RESPONSE}" | grep -qi '^Set-Cookie:.*access_token'; then
  echo "PASS: 6b. Login response includes Set-Cookie: access_token"
else
  echo "FAIL: 6b. Login response missing Set-Cookie: access_token"
  FAILS=$((FAILS + 1))
fi

# 7. GET / (SPA) -> 200, routing sanity
STATUS_7="$(curl -k -s -o /dev/null -w '%{http_code}' "${WAF_URL}/")"
check_status "7. GET / (SPA routing sanity)" "200" "${STATUS_7}"

echo ""
if [ "${FAILS}" -eq 0 ]; then
  echo "ALL CHECKS PASSED (7/7 assertions + Set-Cookie check)"
  exit 0
else
  echo "FAILED: ${FAILS} assertion(s) did not match expected result"
  exit 1
fi
