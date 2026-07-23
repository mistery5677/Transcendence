*This project has been created as part of the 42 curriculum by hbourlot, joralves, mfrancis, miafonso, ddiogo-f.*

# ft_transcendence

## Description


**ft_transcendence** is a full-stack, real-time multiplayer web application built as the final project of the 42 Common Core. It lets users play **chess** against other players, against an AI opponent (Stockfish), in real time, with matchmaking, live spectating, friends, private messaging, notifications, match history, and player statistics (ELO, win/loss/draw record, streaks).

Key features at a glance:
- Real-time multiplayer chess over WebSockets (Socket.IO)
- Matchmaking and direct/bot game modes- Friends system, private chat, and notifications 
- User profiles, avatars, match history, and ELO-based leaderboard **TODO: Add that we have 4 types of rank rookie/challenger/grandmaster/alumni**
- AI opponent powered by Stockfish **TODO: Add that we can costumize the bot difficult level**
- Secure infrastructure: HTTPS/TLS, WAF (ModSecurity via Nginx), secrets management (HashiCorp Vault)
- Fully containerized with Docker Compose
- Watch ongoing games live in spectator mode, with real-time board updates


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
# TODO: Add the command make safe, if you don't want the logs**
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
                    └────────┬───┬────────┘
                   UI /      │   │       /api
          ┌──────────────────┘   └─────────────────┐
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

***Tech:***
- [Socket.IO documentation](https://socket.io/docs/v4/)
- [NestJS documentation](https://docs.nestjs.com/)
- [Prisma documentation](https://www.prisma.io/docs)
- [React documentation](https://react.dev/)
- [chess.js](https://github.com/jhlywa/chess.js)
- [Stockfish](https://stockfishchess.org/)
- [Chess logic tutorial (N4JS)](https://eclipse.dev/n4js/userguides/n4js-tutorial-chess/n4js-tutorial-chess.html)

***Inspiration:***
- [Chess.com](https://www.chess.com/home)
- [Techologies](https://dev.to/itxnargis/chess-meets-code-how-i-created-a-full-stack-game-using-react-mongodb-2610)

### AI usage

> ⚠️ **TODO — mandatory and must be honest and specific.** The subject requires stating **which AI tools** were used and **for which tasks**.

**AI tools used:**
- Claude
- Gemini
- 🔴`[TODO: any other tools used by the team]`

**Used for:**
- Debugging specific TypeScript/NestJS errors, explaining error messages
- Reviewing/explaining existing code during onboarding to the codebase
- Helping organize/structure code
- Detecting possible vulnerabilities
- Drafting this README's structure and content
- 🔴`[TODO: anything else the team used AI for]`

## Team Information

> ⚠️ **TODO — one entry per team member.**

| Login | Role(s) | Responsibilities |
|---|---|---|
| miafonso | Product Owner + Developer | Account & social features — user profiles, friends system, and player progression (leaderboard, match history) |
| `[TODO]` | `[TODO: PO / PM / Tech Lead / Developer]` | `[TODO: brief description]` |
| `[TODO]` | `[TODO]` | `[TODO]` |
| `[TODO]` | `[TODO]` | `[TODO]` |
| ddiogo-f | Developer | Implement Spectator Mode, Readme.md |

## Project Management

> ⚠️ **TODO — fill in based on how the team actually worked.**

- **Task distribution:** Feature-based branches, one person per module
- **Meetings/sync cadence:** Weekly online meetings — review what was done during the week, define new milestones, and set priorities
- **Project management tool(s):** GitHub Issues for task tracking; Fork (Git GUI client) for day-to-day Git usage
- **Communication channel(s):** WhatsApp and Discord
- **Git workflow:** feature branches , merged into `main`; small, testable, single-purpose commits.

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
- **DTO validation** (`class-validator`) on all `@Body` endpoints

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
| User profiles | Avatar, stats, match history | miafonso |
| Real-time chess gameplay | Move validation, turns, timers, draw/surrender | `[TODO]` |
| Matchmaking | Queue-based matching between players | `[TODO]` |
| AI opponent | Play against Stockfish | `[TODO]` |
| Friends system | Send/accept/reject friend requests | miafonso |
| Private chat | Direct messages between users | `[TODO]` |
| Notifications | Real-time in-app notifications | `[TODO]` |
| Leaderboard / ELO | Ranking based on match results | miafonso |
| Spectator mode | Browse and watch live games in real time without being able to move pieces | ddiogo-f |
| `[TODO: any other feature]` | `[TODO]` | `[TODO]` |

## Modules

Overview table (details for each module below):

| Category | Module | Type | Owner |
|---|---|---|---|
| Web | Framework for frontend and backend (React + NestJS) | Major | 🔴`[TODO]` |
| Web | Real-time features via WebSockets | Major | 🔴`[TODO]` |
| Web | ORM for the database (Prisma) | Minor | miafonso |
| Web | User interaction (chat + profile + friends system) | Major | miafonso |
| Web | Notification system | Minor | 🔴`[TODO]` |
| User Management | Standard user management & authentication | Major | 🔴`[TODO]` |
| User Management | Game statistics and match history | Minor | miafonso |
| Artificial Intelligence | AI Opponent (Stockfish) | Major | 🔴`[TODO]` |
| Gaming and user experience | Complete web-based game (chess, real-time, live matches) | Major | 🔴`[TODO]` |
| Gaming and user experience | Remote players (latency handling, reconnection) | Major | 🔴`[TODO]` |
| Gaming and user experience | Game customization (pawn promotion) | Minor | 🔴`[TODO]` |
| Gaming and user experience | Spectator mode for games | Minor | ddiogo-f |
| Cybersecurity | WAF/ModSecurity + HashiCorp Vault | Major | 🔴`[TODO]` |

> ⚠️ **TODO:** confirm this is the final, complete module list for the team (cross-check against Chapter IV of the subject) — modules are only counted if "fully functional and properly implemented"; non-functional/incomplete = 0.

---

### Web — Framework for frontend and backend (Major)
- **Justification:** 🔴`[TODO]`
- **Implementation:** 🔴`[TODO]`

### Web — Real-time features via WebSockets (Major)
- **Justification:** 🔴`[TODO]`
- **Implementation:** 🔴`[TODO]`

### Web — ORM for the database (Minor)
- **Justification:** Using an ORM lets us work with objects instead of writing raw SQL, making data manipulation more readable and maintainable.
- **Implementation:** Prisma models are defined as objects mapped directly to database tables, so data is created and queried by manipulating objects rather than writing SQL queries by hand.

### Web — User interaction: chat + profile + friends system (Major)
- **Justification:** Essential for a competitive game played among friends — it gives players a way to interact with each other beyond just the match itself.
- **Implementation:** User records connect the database to the frontend with real-time updates. Friend requests are modeled with an explicit state (pending/accepted/rejected) per request. The private chat part of this module was implemented by joralves.

### Web — Notification system (Minor)
- **Justification:** 🔴`[TODO]`
- **Implementation:** 🔴`[TODO]`

### User Management — Standard user management & authentication (Major)
- **Justification:** 🔴`[TODO]`
- **Implementation:** 🔴`[TODO]`

### User Management — Game statistics and match history (Minor)
- **Justification:** Gives players a timeline of their progress and account evolution over time.
- **Implementation:** After each match ends, the backend updates the player's stats in the database (wins/losses/draws, ELO, streaks) and records the match in the history table.

### Artificial Intelligence — AI Opponent, Stockfish (Major)
- **Justification:** 🔴`[TODO]`
- **Implementation:** 🔴`[TODO]`

### Gaming — Complete web-based game: chess (Major)
- **Justification:** 🔴`[TODO]`
- **Implementation:** 🔴`[TODO]`

### Gaming — Remote players (Major)
- **Justification:** 🔴`[TODO]`
- **Implementation:** 🔴`[TODO]`

### Gaming — Game customization: pawn promotion (Minor)
- **Justification:** 🔴`[TODO]`
- **Implementation:** 🔴`[TODO]`

### Gaming — Spectator mode (Minor)
- **Justification:** the real-time infrastructure built for the core game already supported adding more participants to a live match, so extending it to read-only spectators gave the platform a social, "game room" feel at low extra cost.
- **Implementation:** spectators join the same real-time session as the players but in a read-only role, so they see the live board update without being able to move pieces. Active games only exist in memory while in progress, so no database changes were needed.

### Cybersecurity — WAF/ModSecurity + HashiCorp Vault (Major)
- **Justification:** 🔴`[TODO]`
- **Implementation:** 🔴`[TODO]`

## Individual Contributions

> ⚠️ **TODO — one subsection per team member, written honestly (this is explicitly graded on honesty).**

### miafonso
- Features/modules: **User interaction: chat + profile + friends system (Major)**: Implemented the friend request and profile.
                    **Game statistics and match history (Minor)**: Implemented the leaderboard, game rank and the math history system

- Challenges faced and how they were overcome: Making the connection between the frontend, backend and data-base

### `[TODO: login2]`
- Features/modules: `[TODO]`
- Challenges faced and how they were overcome: `[TODO]`

### `[TODO: login2]`
- Features/modules: `[TODO]`
- Challenges faced and how they were overcome: `[TODO]`

### `[TODO: login2]`
- Features/modules: `[TODO]`
- Challenges faced and how they were overcome: `[TODO]`

### ddiogo-f
- Implemented **spectator mode**: users can browse live games and watch them update in real time, with a read-only board and a spectator-specific view of the game.
- Fixed a bug where a finished game could reappear as if still active after a rematch.
- Fixed a multi-tab disconnection bug in the presence gateway (removed a "kill zombie socket" policy that was disconnecting legitimate second tabs of the same user).

## Known Limitations

> ⚠️ **TODO — optional but recommended.** e.g.:
- `[TODO: any known edge case, such as the still-unconfirmed "Watch from the same tab you're playing in" scenario]`

## License / Credits

> ⚠️ **TODO — optional.**