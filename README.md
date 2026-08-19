# Task Management App

A full-stack task manager with per-user accounts, JWT auth, file attachments, email
notifications, and live weather for each task's location.

> Built with NestJS (backend), Next.js (frontend), and MongoDB.

---

## 1. Tech Stack

| Layer      | Choice                                                  |
|------------|----------------------------------------------------------|
| Backend    | NestJS 10, TypeScript                                     |
| Database   | MongoDB + Mongoose                                         |
| Auth       | JWT (Passport), bcryptjs password hashing                  |
| File Upload| Cloudinary (via `multer` memory storage)                   |
| Email      | Resend                                                      |
| Weather    | OpenWeatherMap                                              |
| Frontend   | Next.js 14 (App Router), TypeScript                         |
| Styling    | Tailwind CSS                                                 |
| State      | Zustand (auth), TanStack React Query (server state/caching)  |
| HTTP Client| Axios with a JWT bearer interceptor                            |

## 2. Architecture

```
Browser (Next.js)
   │  Axios + JWT bearer token
   ▼
NestJS REST API (/api)
   │
   ├─▶ AuthModule    → register/login, JWT issue & verification
   ├─▶ TasksModule   → CRUD, ownership checks, filtering, pagination
   ├─▶ EmailModule   → Resend: task-created / task-completed emails
   ├─▶ UploadModule  → Cloudinary: task file/image attachments
   └─▶ WeatherModule → OpenWeatherMap: live weather per task location
   │
   ▼
MongoDB Atlas
```

**Why MongoDB over Postgres?** Task documents are simple, mostly flat, and don't need
cross-table joins — a single `Task` collection referencing `User` by ObjectId (with a
compound index on `user + status + priority + dueDate`) covers every filter in the spec
cleanly. Mongoose schemas still enforce required fields and enums, so we keep most of
the data-integrity benefits of a relational schema without the extra migration overhead.

**Why the third-party calls live in their own services.** `EmailService`, `UploadService`,
and `WeatherService` are self-contained and only reference environment variables — never
credentials that come from user input — from `TasksService`. This keeps each provider
swappable (e.g. Resend → SendGrid, or Cloudinary → S3) without touching business logic.
Email sends are fire-and-forget: a Resend outage never blocks a task write, since the
information users actually care about (their task) has already been saved. Weather
lookups are cached in memory for 10 minutes per city to stay comfortably under the free
OpenWeatherMap rate limit when the dashboard is refreshed often.

## 3. Project Structure

```
task-app/
├── backend/                        # NestJS API
│   └── src/
│       ├── auth/                   # register/login, JWT strategy & guard
│       ├── users/                  # User schema + service
│       ├── tasks/                  # Task schema, DTOs, service, controller
│       ├── email/                  # Resend wrapper
│       ├── upload/                 # Cloudinary wrapper
│       ├── weather/                # OpenWeatherMap wrapper + cache
│       ├── common/                 # Global exception filter, @CurrentUser decorator
│       ├── app.module.ts
│       └── main.ts
│
└── frontend/                       # Next.js App Router
    ├── app/
    │   ├── login/, register/       # Auth pages
    │   ├── dashboard/              # Task list, filters, pagination
    │   └── tasks/[id]/             # Task detail page
    ├── components/                 # TaskCard, TaskFormModal, FilterBar, ...
    ├── hooks/useTasks.ts           # React Query CRUD hooks
    └── lib/                        # api.ts (Axios), store.ts (Zustand), types.ts
```

## 4. Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- A MongoDB connection string (free tier at [mongodb.com/atlas](https://mongodb.com/atlas))
- Free API keys for: [Resend](https://resend.com/api-keys), [Cloudinary](https://cloudinary.com/console), [OpenWeatherMap](https://openweathermap.org/api)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, RESEND_API_KEY, CLOUDINARY_*, OPENWEATHER_API_KEY
npm run start:dev
```
Backend runs at `http://localhost:5000/api`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```
Frontend runs at `http://localhost:3000`.

### Notes on running without every key configured
The app degrades gracefully if a third-party key is missing rather than crashing:
- No `RESEND_API_KEY` → emails are logged to the console instead of sent.
- No Cloudinary credentials → file uploads return a clear 500 error; task creation/edit
  without a file still works.
- No `OPENWEATHER_API_KEY` → tasks simply show no weather badge.

This makes local development possible even before you've collected every API key.

## 5. Environment Variables

See `backend/.env.example` and `frontend/.env.example` for the full list. Summary:

**Backend**
| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | JWT signing |
| `RESEND_API_KEY` / `EMAIL_FROM` | Transactional email |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | File uploads |
| `OPENWEATHER_API_KEY` | Weather lookups |
| `CLIENT_URL` | Allowed CORS origin |

**Frontend**
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the deployed backend, including `/api` |

## 6. Deployment

1. **Backend** → Render / Railway / Fly.io. Set all backend env vars in the platform's
   dashboard. Build command: `npm install && npm run build`. Start command: `npm run start:prod`.
2. **Database** → MongoDB Atlas (use the connection string as `MONGO_URI`).
3. **Frontend** → Vercel. Set `NEXT_PUBLIC_API_URL` to your deployed backend's URL
   (e.g. `https://your-api.onrender.com/api`). Update the backend's `CLIENT_URL` to your
   Vercel domain so CORS allows it.

## 7. API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account, returns JWT |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/tasks` | List tasks (query: `page`, `limit`, `status`, `priority`, `search`, `startDate`, `endDate`, `sortBy`, `sortOrder`) |
| POST | `/api/tasks` | Create task (multipart: fields + optional `file`) |
| GET | `/api/tasks/:id` | Get one task (weather attached live) |
| PATCH | `/api/tasks/:id` | Update task (multipart, all fields optional) |
| DELETE | `/api/tasks/:id` | Delete task |

All `/api/tasks*` routes require `Authorization: Bearer <token>` and only operate on the
authenticated user's own tasks (enforced server-side, not just hidden in the UI).

## 8. Trade-offs & What I'd Improve With More Time

- **No refresh tokens** — the JWT is long-lived (7 days) rather than using a short-lived
  access token + refresh token pair, which would be the safer pattern for production.
- **No automated tests** — given the time box, I prioritized a complete, working
  feature set over unit/e2e test coverage. `TasksService` and the auth flow are the
  highest-value places to add Jest tests next.
- **Weather cache is in-memory** — fine for a single backend instance, but would need
  Redis (or similar) to stay consistent across multiple deployed instances.
- **No optimistic UI updates** — task mutations wait for the server round-trip before
  the UI updates; React Query's optimistic update API would make this feel snappier.
- **No rate limiting** on auth endpoints — would add `@nestjs/throttler` next to guard
  against brute-force login attempts.
- **Search is a MongoDB regex**, not a text index — fine at small scale, but a proper
  `$text` index (or a search service) would scale better with larger task volumes.
