# Wire — Realtime Chat

A real-time chat app: **Node.js + Express + Socket.io** backend with a **SQLite**
message store, and a **React (Vite)** web frontend. Messages are delivered
instantly over Socket.io and persisted, so chat history survives a page
refresh or server restart.

## Setup & running it locally

Requires **Node.js 22** and **npm**. Two terminals — one per app.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # defaults work out of the box for local dev
npm start                 # or: npm run dev (nodemon, auto-restart)
```

The server starts on `http://localhost:4000` and creates `backend/data/chat.db`
(SQLite) automatically on first run — no separate database install needed.

Health check: `curl http://localhost:4000/health`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # points the client at the backend above
npm run dev
```

Open `http://localhost:5173`. Open it in two browser tabs (or two browsers)
with two different usernames to see real-time delivery, presence, and typing
indicators working between them.

To build a production bundle: `npm run build` (outputs to `frontend/dist`,
servable by any static host — Vercel, Netlify, S3, nginx, etc.).

## Environment variables

**backend/.env**
| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | Port the Express + Socket.io server listens on |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin, also used for the Socket.io CORS config |
| `DB_PATH` | `./data/chat.db` | Path to the SQLite file (created if missing) |

**frontend/.env**
| Variable | Default | Purpose |
|---|---|---|
| `VITE_SERVER_URL` | `http://localhost:4000` | Base URL used for both the REST API and the Socket.io connection |

## REST API

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/messages?limit=200` | — | Returns chat history, oldest first, capped at `limit` (max 500) |
| `POST` | `/api/messages` | `{ "username": string, "text": string }` | Persists a message and broadcasts it over Socket.io to every connected client. Kept mainly as a resilience fallback (see below) — the socket path is the primary send path. |
| `GET` | `/health` | — | Basic liveness check, uptime in seconds |

## Socket.io events

| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `user:join` | client → server | `username` | Registers a socket as online under a username; triggers a presence broadcast |
| `message:send` | client → server | `{ text }` (+ ack callback) | Sends a message; server persists it and broadcasts `message:new` to everyone, including the sender |
| `message:new` | server → all clients | message object | A new message was persisted; append it to the UI |
| `presence:update` | server → all clients | `string[]` of usernames | Full online-user list, sent whenever someone joins or disconnects |
| `typing:start` / `typing:stop` | client → server | — | Notifies others that this user is/isn't typing |
| `typing:update` | server → all clients | `{ username, isTyping }` | Relayed typing state, used to drive the "X is typing…" indicator |
| `message:error` | server → client | `{ error }` | Emitted only if a `message:send` had no ack callback attached and failed |

Disconnects are handled in the `disconnect` handler: the user is removed from
the in-memory presence map, a fresh `presence:update` is broadcast, and any
lingering "is typing" state for that user is cleared out for everyone else.


## Assumptions made

- "Login" is intentionally a dummy username prompt with no password or
  account system, per the brief's own description of it as a bonus
  ("Username-based login (dummy authentication)").
- A single shared room is sufficient; there's no direct-messaging or
  multi-channel requirement in the brief.
- Message history is capped at 200 messages by default (configurable via the
  `limit` query param, max 500) to keep the initial payload small; nothing in
  the brief called for pagination/infinite scroll, so it wasn't built.
- "Online/offline status" is interpreted at the level of "connected to the
  socket right now," shown as a live presence list — there's no concept of
  a user existing in the system before they've joined a chat session, since
  there are no persistent accounts.
- CORS is locked to a single configurable origin (`CLIENT_ORIGIN`) rather than
  wildcarded, since this is meant to run as a paired frontend/backend rather
  than a public API.

## Bonus features implemented

-  Username-based login (dummy authentication)
-  Typing indicator ("X is typing…", debounced, cleared on disconnect)
-  Online/offline user status (live presence rail + connection indicator)
-  Messages stored in a database (SQLite via `better-sqlite3`)
-  Message read/delivered status — not implemented (would need per-user
  read receipts tracked against the message table; skipped to keep scope
  tight given the other four bonus items)


## What was tested

Before writing this README, I actually ran the app rather than assuming the
code was correct:

- Started the backend, hit `/health`, `POST /api/messages`, and
  `GET /api/messages` with `curl` and confirmed the message round-tripped
  through SQLite.
- Built the frontend with `vite build` to catch any compile errors.
- Ran the Vite dev server and confirmed it served correctly.
- Wrote a small Socket.io test script that opens two simultaneous client
  connections ("alice" and "bob") and confirmed, live: presence broadcasts
  reach both clients, "alice" typing is relayed to "bob" as a `typing:update`
  event, and a message sent by "alice" arrives at "bob" in real time via
  `message:new` with a server ack — i.e. the mandatory real-time path
  actually works, not just compiles.


