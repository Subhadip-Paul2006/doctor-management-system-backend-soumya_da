# DEWASI GROUP — Doctor Appointment & Clinic Management System 
#DOCTOR CONTACT

A production-grade backend for a multi-clinic, multi-role healthcare appointment and queue management platform. Built with Node.js, Express, Prisma, PostgreSQL (Supabase), Redis, and Socket.io.

Live deployment: https://doctor-management-system-backend.onrender.com
Health check: `GET /api/v1/health`
API Docs (local only, disabled in production): `http://localhost:8000/api-docs`

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Roles](#roles)
- [Features by Module](#features-by-module)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Running with Docker](#running-with-docker)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Known Limitations / Roadmap](#known-limitations--roadmap)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Framework | Express.js |
| Database | PostgreSQL (hosted on Supabase) |
| ORM | Prisma 6.x (deliberately not upgraded to 7 — breaking changes to datasource config) |
| Cache / Pub-Sub | Redis (ioredis) — Upstash in production |
| Realtime | Socket.io |
| Auth | JWT (access + refresh tokens, hashed at rest), Google OAuth (Passport.js, Patient-only) |
| Validation | Zod |
| Logging | Pino |
| Password Hashing | bcrypt |
| Email | Nodemailer |
| File Storage | Cloudinary (profile photos, clinic logos, avatars) |
| PDF Generation | PDFKit |
| Excel Generation | ExcelJS |
| API Docs | swagger-jsdoc + swagger-ui-express |
| Rate Limiting | express-rate-limit |
| Containerization | Docker |
| Hosting | Render (app) + Upstash (Redis) + Supabase (Postgres) |

---

## Architecture

Feature-based modular architecture. Each module under `src/modules/<name>/` follows the same internal shape:

```
<module>/
  <module>.controller.js   — handles req/res, calls service layer
  <module>.service.js      — business logic, orchestrates repository calls
  <module>.repository.js   — all Prisma/DB queries live here
  <module>.routes.js       — Express router + Swagger JSDoc annotations
  <module>.validation.js   — Zod schemas for request validation
  <module>.constants.js    — module-specific constants
  <module>.helper.js       — small pure helper functions
```

Controllers never talk to Prisma directly; services never build HTTP responses.

---

## Roles

Six roles share a single `User` table, with role-specific profile tables:

- **SUPER_ADMIN** — platform owner, manages global settings (booking window, etc.), creates Admin and Clinic accounts.
- **ADMIN** — approves clinics, verifies doctors, manages users, creates Clinic accounts, moderates reviews. Cannot touch platform-wide settings — that's Super Admin only.
- **CLINIC** — manages its own doctors, receptionists, working hours, holidays, announcements.
- **RECEPTIONIST** — manages assigned doctors' queues, books walk-in/phone appointments.
- **DOCTOR** — has a global profile, can work at multiple clinics via approved associations.
- **PATIENT** — books appointments, views queue status, submits reviews, manages own profile.

**Public self-registration (`POST /auth/register`) is Patient-only.** Clinic accounts are created exclusively by Super Admin or Admin (`POST /admin/clinics`, auto-approved). Doctor and Receptionist accounts are created by a Clinic, which sets their initial login credentials. Admin accounts are created exclusively by Super Admin (`POST /admin/admins`).

---

## Features by Module

### Auth
- Register (Patient-only) / login (JWT access + refresh tokens)
- Refresh token rotation, refresh tokens are SHA-256 hashed at rest (not stored in plaintext)
- Logout, forgot/reset password via email OTP — restricted to self-registered accounts only
- Google OAuth login — **Patient accounts only**; any other role attempting Google sign-in is rejected with a clear error
- Role-based access control (RBAC) middleware on every protected route

### Clinic
- Clinic profile management
- Create Doctor and Receptionist accounts (with clinic-set initial passwords)
- Assign receptionists to one or more doctors, scoped per-clinic (a receptionist's assignment to a doctor is specific to one clinic, correctly isolating access when that doctor also works elsewhere)
- Change Doctor/Receptionist password (staff cannot change their own — Clinic or Super Admin only)
- Upload clinic logo; update a doctor's photo or a receptionist's avatar on their behalf (old Cloudinary asset auto-deleted on replacement)
- Configure working hours per day of week, add/remove holidays, toggle online-consultation availability
- Approve or reject incoming doctor connection requests (multi-clinic feature)

### Doctor (Multi-Clinic)
- Global doctor profile, independent of any single clinic
- Search doctors by name (Clinic side) / search clinics by name (Doctor side)
- Send/receive/accept/reject clinic connection requests, with automatic schedule-conflict detection — conflict checks are enforced inside a Serializable transaction at approval time to prevent race conditions between two concurrent overlapping approvals
- Cancel an approved or pending association
- Upload profile photo (Cloudinary, old asset auto-deleted on replacement)
- Set average consultation minutes per clinic (used for patient wait-time estimates) — editable by the Doctor themselves, their Clinic, an assigned Receptionist, or Admin/Super Admin

### Patient
- Two patient types:
  - **Guest/walk-in** — created by a receptionist with just Name + Age (+ optional phone), no login account at all
  - **Self-registered** — full account via `/auth/register`, with Name, Email, Mobile, DOB
- Unified phone-number search across both types
- Self-service profile update (DOB, gender, blood group, address, geolocation)

### Appointment
- Search bookable doctors by name, clinic, city, or clinic+date (returns live queue snapshot)
- Online booking (Patient) — subject to booking-window rule, clinic working hours/holidays, and the clinic's online-consultation toggle
- Reception booking (Receptionist/Clinic) for walk-in, phone, or existing patients — bypasses the online-only restrictions but still respects holidays/closed days; access is strictly scoped (a Receptionist can only book for doctor+clinic pairs they're assigned to; a Clinic can only book for its own doctors)
- Fully independent, sequential token counter **per doctor per clinic per day** — online and reception bookings share the same counter
- Patient's own appointment list includes a live `patientsAhead` count and `estimatedWaitMinutes` (derived from the doctor's configured consultation time) — shown even when the queue mode is PRIVATE, since it's a personalized estimate rather than a global queue-state leak
- Queue detail is redacted (no `currentToken`/`lastTokenIssued`) if the doctor's queue mode is PRIVATE

### Queue
- Full queue lifecycle: Next, Previous, Skip, Recall (specific token), Pause, Resume, Close, Reopen, Emergency token insertion
- All actions logged to an audit trail (`QueueLog`)
- Live updates broadcast via Socket.io, room-scoped per doctor+clinic (`queue:{doctorId}:{clinicId}`)
- Two additional live events: `tokenCalled` (fires on every Next) and `appointmentCompleted` (fires when a patient's consultation finishes) — both also trigger a **persisted** notification (see Notifications module) so patients see it even if they weren't connected at that moment
- Strict access control: a Receptionist can only control queues for doctor+clinic pairs they're specifically assigned to; Clinic/Admin/Super Admin bypass this
- Queue modes: **LIVE** (full visibility) and **PRIVATE** (patients see only their own token + status) — **TIME_SLOT** mode is defined in the schema but not yet implemented

### Notifications
- Persisted, database-backed notification inbox (separate from the ephemeral Socket.io events above — this is durable history)
- Auto-created on: appointment booked, token called ("your turn"), consultation completed
- List own notifications (paginated), unread count (for a badge), mark one or all as read
- `notifyUser()` never throws — a failed notification write never blocks the action that triggered it

### Reviews & Feedback
- Patient submits a 1–5 star rating + written review, tied to a specific **completed** appointment (one review per appointment, enforced)
- Reviews start `PENDING` and are invisible publicly until an Admin approves them
- Average rating computed live via aggregation (never stale/cached) per doctor and per clinic
- Any authenticated user can report a review as inappropriate; Admin has a dedicated moderation queue for both pending and reported reviews

### Admin
- Approve/reject clinic registrations; create Clinic accounts directly (auto-approved)
- Verify doctors
- List/deactivate any user account
- Create Admin accounts (Super Admin only)
- Platform-wide settings — booking window minutes, etc. (Super Admin only; Admin is explicitly blocked from this)
- Platform stats (total users, clinics, doctors, patients, approval counts)
- Update any Doctor's photo, Clinic's logo, or user's avatar on their behalf

### Announcement
- Platform-wide announcements (Super Admin/Admin)
- Clinic-specific announcements, optionally tied to a specific doctor
- Live broadcast via Socket.io to clients subscribed to that clinic's room
- Deactivation (Clinic can only deactivate their own; Admin can deactivate any)

### Dashboard
- Doctor dashboard: total clinics, total patients, clinic-wise patient count, today's appointments, upcoming schedule, pending/approved clinic requests
- Clinic dashboard: total/active doctors, pending/approved/rejected doctor requests, today's appointments, queue summary
- Note: dashboards currently reflect real booking data only for a doctor's *primary* clinic; secondary/associated clinics show correctly in lists but patient counts there are not yet aggregated

### Reports
- **Daily, weekly (Mon–Sun), monthly, yearly, and custom date-range** clinic reports
- Every report available as JSON, PDF, or **Excel** (`?format=json|pdf|excel`)
- Status breakdown, booking-source breakdown, per-doctor breakdown, estimated revenue
- Full clinic patient list PDF (Name, Age, Phone) — Clinic and Receptionist
- Doctor + clinic + exact-date-scoped patient list PDF (Name, Age, DOB, Phone) — includes all booking sources

---

## Folder Structure

```
src/
  app.js                 — Express app setup, middleware, route mounting
  server.js              — HTTP server bootstrap, Socket.io init, graceful shutdown
  config/                — env, db, redis, logger, socket, cloudinary, passport, swagger config
  middlewares/            — auth, role, error, rate limiter, upload, 404 handler
  modules/                — auth, clinic, doctor, patient, appointment, queue, admin,
                              announcement, dashboard, report, review, notification, user
  sockets/                — Socket.io event emitters (queue, announcement)
  utils/                  — ApiError, ApiResponse, asyncHandler, token generator,
                              PDF generator, Excel generator, Cloudinary upload, email service
prisma/
  schema.prisma           — full data model
  migrations/             — migration history
  seed.js                 — creates the initial Super Admin + PlatformSetting row
Dockerfile
docker-compose.yml
.dockerignore
.env.example
```

---

## Getting Started

```bash
git clone https://github.com/soumya28022005/doctor-management-system-backend.git
cd "jeet backend"
npm install
cp .env.example .env   # fill in real values — see below
npx prisma generate
npx prisma migrate dev
node prisma/seed.js    # creates Super Admin + platform settings row
npm run dev
```

---

## Environment Variables

See `.env.example` for the full list. Key ones:

```
NODE_ENV=development
PORT=8000

DATABASE_URL=            # Supabase pooled connection (port 6543, ?pgbouncer=true)
DIRECT_URL=              # Supabase direct connection (port 5432) — required for migrations

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

REDIS_URL=               # redis://localhost:6379 locally, rediss://... (TLS) on Upstash in prod

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CLIENT_URL=              # frontend URL, used for CORS and OAuth redirect
```

**Never commit `.env`.**

---

## Database

- PostgreSQL, hosted on Supabase
- Prisma ORM — schema in `prisma/schema.prisma`
- Migrations tracked in `prisma/migrations/`
- Seed script creates the initial Super Admin account and the single required `PlatformSetting` row

```bash
npx prisma migrate deploy   # apply migrations against a fresh database
```

---

## Running with Docker

```bash
docker compose up --build
```

Starts the app (port 8000) plus a local Redis container. Postgres always points at Supabase, even in local Docker development.

---

## Deployment

Deployed on **Render**, connected directly to this GitHub repo — every push to `main` triggers an automatic rebuild from the `Dockerfile`.

- **Database:** Supabase
- **Redis:** Upstash (`rediss://` TLS connection string)
- **Environment variables:** set individually in Render's dashboard, never committed

---

## API Documentation

Interactive Swagger UI at `/api-docs` — **only available when `NODE_ENV !== "production"`**, intentionally disabled in production to avoid exposing the full API surface publicly.

---

## Security

- Passwords hashed with bcrypt
- Refresh tokens hashed (SHA-256) before storage — never stored in plaintext
- JWT access tokens (short-lived) + rotated refresh tokens
- Strict, per-clinic-scoped role-based access control — a Receptionist's doctor assignment is specific to one clinic, preventing cross-clinic privilege escalation when a doctor works at multiple locations
- Rate limiting: 300 req/15min globally, 10 req/15min on login/register, 5 req/hour on OTP endpoints
- Helmet security headers (CSP disabled specifically to allow Swagger UI to render)
- CORS restricted to `CLIENT_URL`
- Input validation on every endpoint via Zod
- Google OAuth restricted to Patient accounts only — staff/admin roles must use email+password

---

## Known Limitations / Roadmap

- **No automated test suite** — Jest/Supertest were planned but never implemented
- **Time Slot queue mode** — schema field exists, booking logic isn't built; only LIVE and PRIVATE modes are functional
- **Prescription and Pharmacy modules** — deliberately out of scope for this version
- **Dashboard data for secondary clinics** — a doctor's Doctor/Clinic dashboard only reflects real appointment data for their *primary* clinic
- **Patient Growth & Analytics** (trend graphs, growth-rate %, new-vs-returning patient classification) and **Daily Patient Dashboard** — requested by the client, not yet built
- No device push notifications (FCM/APNs) — real-time signals are Socket.io (live, requires an open connection) plus a persisted in-app notification inbox; no notifications reach a closed app
- A few empty leftover module folders/files exist as scaffolding from early planning — harmless

---

## License

Private project — not currently licensed for public/commercial reuse.