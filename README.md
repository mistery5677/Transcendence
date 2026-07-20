*This project has been created as part of the 42 curriculum by 🔴**[TODO: login1]**, 🔴**[TODO: login2]**, ddiogo-f.*

# ft_transcendence

## Description


**ft_transcendence** is a full-stack, real-time multiplayer web application built as the final project of the 42 Common Core. It lets users play **chess** against other players, against an AI opponent (Stockfish), in real time, with matchmaking, live spectating, friends, private messaging, notifications, match history, and player statistics (ELO, win/loss/draw record, streaks).

Key features at a glance:
- Real-time multiplayer chess over WebSockets (Socket.IO)
- Matchmaking and direct/bot game modes
- Watch ongoing games live in spectator mode, with real-time board updates
- Friends system, private chat, and notifications
- User profiles, avatars, match history, and ELO-based leaderboard
- AI opponent powered by Stockfish
- Secure infrastructure: HTTPS/TLS, WAF (ModSecurity via Nginx), secrets management (HashiCorp Vault)
- Fully containerized with Docker Compose

> ⚠️ **TODO:** confirm final feature list matches what was actually implemented/graded, and add a one-line "why chess" note if relevant (the subject's reference example is Pong; this team built a chess platform instead — worth stating explicitly here).

## Instructions

### Prerequisites

- Docker and Docker Compose
- `openssl` (to generate strong secrets for `.env`)
- Node.js version v20.20.2 — only needed if you ever run frontend/backend outside Docker

### 1. Clone and configure secrets

Secrets are **never** committed to the repository. Copy the template and fill it with real values:

```bash
cp .env.example .env
```

Generate strong values — do not reuse the placeholders:

```bash
openssl rand -hex 32     # copy to JWT_SECRET
openssl rand -hex 32     # copy to VAULT_ROOT_TOKEN
openssl rand -hex 32     # copy to VAULT_BACKEND_TOKEN (least-privilege token the backend uses)
```

Required `.env` variables:

| Variable | Description |
|---|---|
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password — generate a strong one, don't reuse the example |
| `POSTGRES_DB` | PostgreSQL database name |
| `DATABASE_URL` | Full Prisma connection string, built from the three variables above |
| `BACKEND_PORT` | Port the NestJS backend listens on internally (`3000`) |
| `FRONTEND_PORT` | Port the Vite frontend listens on internally (`5173`) |
| `VITE_API_URL` | URL the frontend uses to reach the backend API |
| `NODE_ENV` | `development` or `production` |
| `JWT_SECRET` | Secret used to sign auth tokens (64-char hex) |
| `VAULT_ROOT_TOKEN` | Root token for HashiCorp Vault (used only by `vault-init`) |
| `VAULT_BACKEND_TOKEN` | Least-privilege token the backend uses to read its own secrets from Vault |
| `WAF_PORT` | Public HTTP port (redirects to HTTPS) — `8080` |
| `WAF_SSL_PORT` | Public HTTPS port — `8443` |

`.env` is git-ignored — keep it that way. An `.env.example` with safe placeholder values is committed instead.

### 2. Build and start the stack

```bash
make up        # or: docker compose up -d --build
```

Startup order is enforced by Compose:
1. `vault` starts and becomes healthy.
2. `vault-init` seeds the JWT and DB secrets into Vault, writes a read-only `backend-read` policy, and mints a least-privilege token for the backend — then exits.
3. `backend` boots **only after** `vault-init` succeeds, authenticating with the least-privilege token (not root) and fetching its secrets from Vault. It fails fast if Vault is unreachable.
4. `frontend` and the `waf` (Nginx + ModSecurity) come up last.

### 3. Access the app

Open **https://localhost:8443**. The certificate is self-signed, so accept the browser warning. Plain HTTP on `:8080` redirects (301) to HTTPS. Auth cookies are issued with the `Secure` attribute.

> Note: the **WAF is the only component exposed to the host** — the frontend, backend, and database have no published ports and are not directly reachable from outside the Docker network.

### 4. Useful commands

```bash
make down       # stop the stack
make generate   # prisma generate inside the backend container
make db-push    # apply the Prisma schema to the database
make logs       # follow logs
```

Extra commands that came up during development (equivalent `docker exec` forms, useful when not going through `make`):

```bash
npx prisma generate                                          # regenerate the Prisma client after a schema change
docker restart chess_backend                                 # restart the backend container
docker exec -it chess_backend npm install @prisma/client     # (re)install/update the Prisma client inside the container
docker exec -it chess_database psql -U transcendence_admin -d transcendence_db   # open a psql shell (credentials in .env)
```

### 5. Verify the security controls

Smoke tests live in `scripts/`:

```bash
bash scripts/verify-tls.sh      # HTTPS 200, HTTP→HTTPS redirect, Secure cookie
bash scripts/verify-waf.sh      # SQLi / XSS / traversal / scanner requests are blocked (403)
bash scripts/verify-legal.sh    # legal pages served + input validation (400 on bad input)
```

## Architecture

The entire stack runs under Docker Compose on a private network. The **WAF is the only component exposed to the host** — the frontend, backend, and database are not directly reachable from outside.

```
                           Host
                             │  https://localhost:8443  (http:8080    → 301 → https)
                             ▼
                    ┌─────────────────────┐
                    │  WAF (ModSec/Nginx) │  TLS termination +    OWASP CRS filtering
                    └────────┬────────────┘
                   UI /      │     │     /api
          ┌──────────────────┘     └───────────────┐
          ▼                                        ▼
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
- **Secrets** (JWT signing key, DB credentials) are seeded into **HashiCorp Vault** at startup; the backend fetches them from Vault and refuses to boot without them.
- **`vault-init`** is a one-shot job that seeds Vault before the backend starts.

## Resources

> ⚠️ **TODO — list the references you actually used.** Suggested starting points 🔴**(confirm/replace)**:

- [Socket.IO documentation](https://socket.io/docs/v4/)
- [NestJS documentation](https://docs.nestjs.com/)
- [Prisma documentation](https://www.prisma.io/docs)
- [React documentation](https://react.dev/)
- [chess.js](https://github.com/jhlywa/chess.js)
- [Stockfish](https://stockfishchess.org/)
- `[TODO: add any articles/tutorials that were genuinely used]`

### AI usage

> ⚠️ **TODO — this section is mandatory and must be honest and specific.** The subject requires stating **for which tasks** and **which parts of the project** AI was used. Draft to complete, e.g.:

AI assistance was used for:
- Debugging specific TypeScript/NestJS errors, explaining error messages
- Reviewing/explaining existing code during onboarding to the codebase
- Drafting this README structure

## Team Information

> ⚠️ **TODO — one entry per team member.**

| Login | Role(s) | Responsibilities |
|---|---|---|
| `[TODO]` | `[TODO: PO / PM / Tech Lead / Developer]` | `[TODO: brief description]` |
| `[TODO]` | `[TODO]` | `[TODO]` |
| `[TODO]` | `[TODO]` | `[TODO]` |
| ddiogo-f | Developer | Implement Spectator Mode, Readme.md |

## Project Management

> ⚠️ **TODO — fill in based on how the team actually worked.**

- **Task distribution:** Feature-based branches, one person per module
- **Meetings/sync cadence:** `[TODO]`
- **Project management tool(s):** GitHub Issues / Fork / Notion
- **Communication channel(s):** WhatsApp / Discord
- **Git workflow:** feature branches (e.g. `i11` for spectator mode), merged into `main`; small, testable, single-purpose commits.

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Backend | NestJS (Node.js) + WebSockets |
| ORM / Database | Prisma → PostgreSQL |
| Secrets | HashiCorp Vault |
| Edge / Security | Nginx + OWASP ModSecurity CRS (WAF), TLS/HTTPS |
| AI opponent | Stockfish engine |
| Orchestration | Docker + Docker Compose |

### Frontend
- **React** + **Vite**, **TypeScript**
- Socket.IO client for real-time communication
- 🔴**[TODO: confirm styling solution — Tailwind CSS utility classes are used throughout the codebase (e.g. `bg-stone-700/50`, `rounded-3xl`); confirm this is the full styling approach and list any additional UI libraries]**

### Backend
- **NestJS** (Node.js), **TypeScript**
- **Socket.IO** (WebSocket gateways) for real-time gameplay, presence, chat, and notifications
- **chess.js** for chess rules/validation
- **Stockfish** engine integration for the AI opponent
- **Prisma ORM**
- DTO validation (`class-validator`) on all `@Body` endpoints

### Database
- **PostgreSQL**, accessed via Prisma ORM.
- *Why PostgreSQL:* relational data (users, matches, friendships, achievements) fits a relational model naturally, and ACID guarantees matter for match history and stats. Using an ORM also satisfies the **Web — Minor: ORM** module.
- **Note on real-time data:** active/in-progress games are **not** stored in the database — they live in memory for performance, and are only stored once finished.

### Infrastructure & Security
- **Docker Compose** for containerized deployment; the **WAF is the only service exposed to the host** — frontend, backend, and database have no published ports.
- **HTTPS/TLS everywhere** via self-signed certificates; plain HTTP (`:8080`) 301-redirects to HTTPS (`:8443`); auth cookies use `Secure`.
- **WAF** — Nginx + OWASP ModSecurity CRS, blocking SQLi/XSS/path-traversal/scanner traffic.
- **HashiCorp Vault** for secrets management — the backend authenticates with a least-privilege, read-only token (never the root token) and fails to boot if Vault is unreachable.
- **Password hashing** — credentials stored as bcrypt hashes, never plaintext.

### Other significant libraries
- 🔴**[TODO: any additional notable dependencies worth mentioning, e.g. testing libraries]**

## Database Schema

> ⚠️ **TODO — consider adding a generated ER diagram (e.g. via `prisma-erd-generator` or a manual diagram) here.** Table/relationship summary below, generated from `schema.prisma`:

| Model | Purpose | Key relationships |
|---|---|---|
| `user` | Player accounts (email, username, password, avatar, board/background theme preferences) | 1–1 with `Score`; 1–many with `MatchHistory` (as playerA/playerB), `FriendRequest` (sent/received), `UserAchievement`, `PrivateMessage` (sent/received), `Notification` |
| `Score` | Per-user statistics: wins, losses, draws, ELO, best ELO, total games, win streaks | 1–1 with `user` |
| `MatchHistory` | Record of a **finished** match (result, timestamp) | many–1 with `user` (playerA = white, playerB = black) |
| `FriendRequest` | Friend requests between users, with status (`PENDING`/`ACCEPTED`/`REJECTED`) | many–1 with `user` (sender/receiver); unique per sender-receiver pair |
| `UserAchievement` | Unlocked achievements per user | many–1 with `user`; unique per user-achievement pair |
| `PrivateMessage` | Direct messages between users | many–1 with `user` (from/to) |
| `Notification` | In-app notifications (title, message, type, read flag, optional JSON payload) | many–1 with `user` |

> ⚠️ **Note:** in-progress games are **not** represented in this schema by design — they exist only in server memory while active.

## Features List

> ⚠️ **TODO — confirm this list is exhaustive and correct, and fill in the "Implemented by" column.**

| Feature | Description | Implemented by |
|---|---|---|
| Authentication | Signup/login, JWT-based auth | `[TODO]` |
| User profiles | Avatar, stats, match history | `[TODO]` |
| Real-time chess gameplay | Move validation, turns, timers, draw/surrender | `[TODO]` |
| Matchmaking | Queue-based matching between players | `[TODO]` |
| AI opponent | Play against Stockfish | `[TODO]` |
| Friends system | Send/accept/reject friend requests | `[TODO]` |
| Private chat | Direct messages between users | `[TODO]` |
| Notifications | Real-time in-app notifications | `[TODO]` |
| Leaderboard / ELO | Ranking based on match results | `[TODO]` |
| Spectator mode | Browse and watch live games in real time without being able to move pieces | ddiogo-f |
| `[TODO: any other feature]` | `[TODO]` | `[TODO]` |

Minimum required: **14 points**. Points beyond 14 count as bonus (max +5), only if all 14 mandatory points are validated first.

### Confirmed from `ARCHITECTURE.md`

| Category | Module | Type | Points |
|---|---|---|---|
| Web | Use a framework for both frontend and backend (React + NestJS) | Major | 2 |
| Web | Real-time features via WebSockets | Major | 2 |
| Web | Use an ORM for the database (Prisma) | Minor | 1 |
| User Management | Standard user management & authentication (profile, avatar, friends, online status) | Major | 2 |
| User Management | Game statistics and match history | Minor | 1 |
| Artificial Intelligence | AI Opponent (Stockfish) | Major | 2 |
| Gaming and user experience | Complete web-based game (chess, real-time, live matches) | Major | 2 |
| Gaming and user experience | Remote players (network latency handling, reconnection) | Major | 2 |
| Gaming and user experience | Game customization (pawn promotion / "power up") | Minor | 1 |
| **Subtotal** | | | **15** |

### 🔴 Likely additional modules — not listed in `ARCHITECTURE.md`, but appear to already be built (please confirm)

Based on what's actually implemented (WAF/Vault per `README2.md`, and spectator mode per `SPECTATOR_MODE_PROGRESS.md`), these two modules look claimable but weren't in your module breakdown doc — worth double-checking `ARCHITECTURE.md` isn't just outdated:

| Category | Module | Type | Points |
|---|---|---|---|
| Cybersecurity | WAF/ModSecurity (hardened) + HashiCorp Vault for secrets | Major | 2 |
| Gaming and user experience | Spectator mode for games | Minor | 1 |
| Web | Allow users to interact with other users (chat + profile + friends system) | Major | 2 |
| Web | Complete notification system for creation/update/deletion actions | Minor | 1 |
| **Subtotal (if all confirmed)** | | | **6** |

The last two are flagged because the schema/component tree already has `PrivateMessage`, `FriendRequest`, a `Chat` component, `Profile`/`ProfileHeader`/`ProfileOverview`/`ProfileStats`, and a `Notification` model — which line up closely with these module descriptions, even though `ARCHITECTURE.md` doesn't list them.

**Total if everything above is confirmed and validated: up to 21 points** → 14 mandatory + bonus (capped at **+5** regardless of how many extra points are earned).

> ⚠️ **TODO:**
> - Double-check the exact wording of each module against Chapter IV of the subject before evaluation — modules are only counted if "fully functional and properly implemented"; non-functional/incomplete = 0.
> - **How each module was implemented:** one short paragraph per module (technical summary).
> - **Team member(s) per module:** who owned each one.

## Individual Contributions

> ⚠️ **TODO — one subsection per team member, written honestly (this is explicitly graded on honesty).**

### `[TODO: login1]`
- Features/modules: `[TODO]`
- Challenges faced and how they were overcome: `[TODO]`

### `[TODO: login2]`
- Features/modules: `[TODO]`
- Challenges faced and how they were overcome: `[TODO]`

### ddiogo-f
- Implemented **spectator mode**: backend `listActiveGames`/`spectateGame` events, distinct `spectatorState` vs `gameState`, frontend `LiveGames` page, non-draggable board for spectators, spectator-aware `PlayerHeader`/`GameOverModal`.
- Fixed a phantom-game bug on rematch flow (`GameReducer`/`GameOverModal`).
- Fixed a multi-tab disconnection bug in the presence gateway (removed a "kill zombie socket" policy that was disconnecting legitimate second tabs of the same user).

## Known Limitations

> ⚠️ **TODO — optional but recommended.** e.g.:
- `[TODO: any known edge case, such as the still-unconfirmed "Watch from the same tab you're playing in" scenario]`

## License / Credits

> ⚠️ **TODO — optional.**