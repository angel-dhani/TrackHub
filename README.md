# TrackHub — Team Issue/Ticket Tracker

A small full-stack issue-tracking app: teams create tickets, assign them,
move them through a status lifecycle, and see progress on a dashboard.

## Problem statement
Organizations often rely on scattered communication channels to report and
track operational issues, making it hard to monitor ownership, priority,
and resolution status. TrackHub centralizes that into one place.

## Objectives
- Centralize issue/ticket management
- Implement role-based access (Admin vs Member)
- Track ticket lifecycle (Open → In Progress → Resolved) with history
- Provide dashboard-based monitoring (counts, resolution rate, charts, time-range filtering)
- Real-time sync across clients (Socket.io)
- Full-text search across tickets and comments (MongoDB text indexes)
- Animated landing page, Reports page (resolution time, per-member breakdown), Settings page

## Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide React icons, Redux Toolkit
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT, bcrypt password hashing

## How this maps to the four checkpoints

| Checkpoint | What covers it |
|---|---|
| **P1 – Responsive Frontend Interface** | `client/src/pages/*` — Tailwind responsive layout, sidebar nav, forms, tables |
| **P2 – Backend API Development** | `server/routes/*`, `server/controllers/*` — REST endpoints (GET/POST/PUT/DELETE), input validation, JWT middleware |
| **P3 – Database Integration** | `server/models/User.js`, `server/models/Ticket.js` — schema design, CRUD via Mongoose |
| **P4 – Frontend & Backend Integration** | `client/src/features/*` (Redux Toolkit thunks) + `client/src/app/api.js` — async requests, dynamic UI updates, error handling |

## Setup

### Backend
```bash
cd server
npm install
cp .env.example .env    # fill in MONGO_URI and JWT_SECRET
npm run dev
```

For a small demo dataset (3 users, 10 tickets): `node seed.js`
For a larger dataset to demo search/scale (~600 tickets, comments, activity): `node seed-large.js`

### Frontend
```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

## Key design decisions (for viva questions)

- **Real-time updates**: Socket.io broadcasts `ticket:created`, `ticket:updated`,
  `ticket:deleted`, and `comment:added` events to all connected clients. The
  Board, Tickets list, Activity feed, and Dashboard each subscribe and refetch
  when a relevant event fires — so if two people have the app open, both see
  changes without refreshing. Kept simple (refetch-on-event) rather than
  patching state directly, which avoids subtle bugs from merging partial
  updates into Redux state.
- **Full-text search**: MongoDB text indexes on `Ticket.title`/`description`
  and `Comment.text`. A search unions ticket matches with tickets whose
  comments match, so searching for a phrase mentioned only in a comment still
  surfaces the right ticket. Chose MongoDB's native text index over a
  separate search engine (e.g. Meilisearch) since it needs no extra
  infrastructure and is sufficient at this data volume.
- **Time-range filtering**: Dashboard summary accepts `?range=7d|30d|90d`,
  filtering the aggregation's `$match` stage by `createdAt`. Computed
  server-side rather than fetching all tickets and filtering client-side, so
  it stays fast as ticket volume grows.

- **Role-based access**: implemented via a `requireRole` middleware that
  checks the role encoded in the JWT. Members only see tickets they created
  or are assigned to; admins see everything — enforced at the query level
  (`ticketController.getTickets`), not just hidden in the UI.
- **First user becomes admin**: simplifies bootstrapping a workspace without
  a separate invite/seed step. Every user after that defaults to `member`.
- **Lifecycle history**: instead of only storing the current `status`, each
  ticket keeps a `history` array so you can show *when* and *by whom* a
  status changed — this is what "track ticket lifecycle" actually means
  rather than just having a status field.
- **Dashboard aggregation**: uses MongoDB's aggregation pipeline
  (`$match` + `$group`) to compute counts by status/priority server-side,
  rather than pulling all tickets to the client and counting in JS —
  more realistic for how this would scale.
- **Scope cut for time**: multi-workspace support (multiple isolated teams)
  was intentionally left out of this build and listed as future scope —
  the current version supports one shared workspace.

## Possible future scope
- Multiple workspaces (multi-tenancy)
- Background job queue (Redis + BullMQ) for async exports and an SLA-breach monitor
- Error/log ingestion webhook with automatic de-duplication (fingerprinting similar reports into one ticket)
- Optimistic UI on drag-and-drop with automatic rollback on failure
- Comments/attachments editing and deletion
- Assignee workload heatmaps and MTTR trend charts
