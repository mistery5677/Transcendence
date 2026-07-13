# Transcendence — Online Chess Platform

## Introduction / Objective

A full-stack, real-time online chess platform. Users register, play live matches
against other players (or an AI opponent), add friends, track match history and
leaderboards, and spectate ongoing games. The project is built as a containerized
system and hardened following security best practices: secrets never live in the
codebase, all traffic passes through a Web Application Firewall over HTTPS, and every
API input is validated server-side.

## Architecture

The entire stack runs under Docker Compose on a private network. The **WAF is the only
component exposed to the host** — the frontend, backend, and database are not directly
reachable from outside.

```
                        Host
                          │  https://localhost:8443  (http:8080 → 301 → https)
                          ▼
                 ┌──────────────────┐
                 │  WAF (ModSec/Nginx) │  TLS termination + OWASP CRS filtering
                 └────────┬─────────┘
                UI /        │        /api
          ┌───────────────┘        └───────────────┐
          ▼                                          ▼
   ┌────────────┐                            ┌────────────┐
   │  frontend  │  React SPA (Vite)          │  backend   │  NestJS + WebSockets
   └────────────┘                            └─────┬──────┘
                                                   │ Prisma ORM
                                       ┌───────────┴───────────┐
                                       ▼                       ▼
                                ┌────────────┐          ┌────────────┐
                                │ PostgreSQL │          │   Vault    │  secrets
                                └────────────┘          └────────────┘
```

- **Realtime** is handled over WebSockets (live moves, presence, chat, spectating).
- **Secrets** (JWT signing key, DB credentials) are seeded into **HashiCorp Vault** at
  startup; the backend fetches them from Vault and refuses to boot without them.
- **`vault-init`** is a one-shot job that seeds Vault before the backend starts.

## Technology Stack

| Layer            | Technology                                             |
|------------------|--------------------------------------------------------|
| Frontend         | React + TypeScript (Vite)                              |
| Backend          | NestJS (Node.js) + WebSockets                         |
| ORM / Database   | Prisma → PostgreSQL                                    |
| Secrets          | HashiCorp Vault                                        |
| Edge / Security  | Nginx + OWASP ModSecurity CRS (WAF), TLS/HTTPS         |
| AI opponent      | Stockfish engine                                       |
| Orchestration    | Docker + Docker Compose                               |

## Complete Setup (security-compliant)

### Prerequisites
- Docker + Docker Compose
- `openssl` (to generate strong secrets)

### 1. Clone and configure secrets
Secrets are **never** committed. Copy the template and fill it with **real** values:
```bash
cp .env.example .env
```
Generate strong values — do not reuse the placeholders:
```bash
openssl rand -hex 32     # JWT_SECRET (64-char hex)
openssl rand -hex 32     # VAULT_ROOT_TOKEN
openssl rand -hex 32     # VAULT_BACKEND_TOKEN (least-privilege token the backend uses)
```
Set in `.env`: `JWT_SECRET`, `VAULT_ROOT_TOKEN`, `VAULT_BACKEND_TOKEN`, a strong
`POSTGRES_PASSWORD`, and a matching `DATABASE_URL`. `.env` is git-ignored — keep it that way.

### 2. Build and start the stack
```bash
make up        # or: docker compose up -d --build
```
Startup order is enforced by Compose:
1. `vault` starts and becomes healthy.
2. `vault-init` seeds the JWT and DB secrets into Vault, writes a read-only `backend-read`
   policy, and mints a least-privilege token for the backend — then exits.
3. `backend` boots **only after** `vault-init` succeeds, authenticating with the
   least-privilege token (not root) and fetching its secrets from Vault (it fails fast if
   Vault is unreachable — no hardcoded secrets).
4. `frontend` and `waf` come up last.

### 3. Access the app
Open **https://localhost:8443**. The certificate is self-signed, so accept the browser
warning. Plain HTTP on `:8080` is redirected (301) to HTTPS. Auth cookies are issued with
the `Secure` attribute.

### 4. Verify the security controls
Smoke tests live in `scripts/`:
```bash
bash scripts/verify-tls.sh      # HTTPS 200, HTTP→HTTPS redirect, Secure cookie
bash scripts/verify-waf.sh      # SQLi / XSS / traversal / scanner requests are blocked (403)
bash scripts/verify-legal.sh    # legal pages served + input validation (400 on bad input)
```

### Useful commands
```bash
make down       # stop the stack
make generate   # prisma generate inside the backend container
make db-push    # apply the Prisma schema to the database
make logs       # follow logs
```

### Security rules in effect
- **No secrets in code or git** — everything sensitive comes from `.env` → Vault.
- **Least-privilege Vault access** — the backend uses a read-only token scoped to its own
  secrets, never the root token.
- **WAF-only exposure** — frontend/backend/database have no host-published ports.
- **TLS everywhere** — HTTP is redirected to HTTPS; cookies are `Secure`.
- **Server-side validation** — all `@Body` endpoints use class-validator DTOs.
- **Password hashing** — credentials are stored as bcrypt hashes, never plaintext.
