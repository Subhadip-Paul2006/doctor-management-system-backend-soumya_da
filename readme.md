# Jeet Backend — Doctor Appointment & Clinic Management System

A production-grade backend for a multi-clinic, multi-role healthcare appointment and queue management platform. Built with Node.js, Express, Prisma, PostgreSQL (Supabase), Redis, and Socket.io.

Live deployment: https://doctor-management-system-backend.onrender.com
Health check: `GET /api/v1/health`
API Docs (local only): `http://localhost:8000/api-docs`

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
| Auth | JWT (access + refresh tokens, hashed at rest), Google OAuth (Passport.js) |
| Validation | Zod |
| Logging | Pino |
| Password Hashing | bcrypt |
| Email | Nodemailer |
| File Storage | Cloudinary (profile photos, clinic logos) |
| PDF Generation | PDFKit |
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

Controllers never talk to Prisma directly; services never build HTTP responses. This keeps business logic testable and swappable independent of the transport layer.

---

## Roles

Six roles share a single `User` table, with role-specific profile tables:

- **SUPER_ADMIN** — platform owner, manages global settings (e.g. booking window)
- **ADMIN** — approves clinics, verifies doctors, manages users
- **CLINIC** — manages its own doctors, receptionists, working hours, holidays, announcements
- **RECEPTIONIST** — manages assigned doctors' queues, books walk-in/phone appointments
- **DOCTOR** — has a global profile, can work at multiple clinics via approved associations
- **PATIENT** — books appointments, views queue status, manages own profile

Only **PATIENT** and **CLINIC** self-register. Doctor and Receptionist accounts are created by a Clinic Admin, who sets their initial login credentials.

---

## Features by Module

### Auth
- Register/login with email + password (JWT access + refresh tokens)
- Refresh token rotation, refresh tokens are SHA-256 hashed at rest (not stored in plaintext)
- Logout (clears refresh token)
- Forgot/reset password via email OTP (Redis-backed, 5-minute expiry) — restricted to self-registered accounts only; Clinic/Admin must reset Doctor/Receptionist passwords manually
- Google OAuth login (auto-creates a Patient account on first login, links by email if the account already exists)
- Role-based access control (RBAC) middleware on every protected route

### Clinic
- Clinic profile management
- Create Doctor and Receptionist accounts (with clinic-set initial passwords)
- Assign receptionists to one or more doctors (many-to-many)
- Change Doctor/Receptionist password (staff cannot change their own)
- Upload clinic logo (Cloudinary)
- Configure working hours per day of week, add/remove holidays, toggle online-consultation availability
- Approve or reject incoming doctor connection requests (multi-clinic feature)

### Doctor
- Global doctor profile, independent of any single clinic
- Search doctors by name (Clinic side) / search clinics by name (Doctor side)
- Send/receive/accept/reject clinic connection requests, with automatic schedule-conflict detection (rejects an approval if the requested day+time overlaps an already-approved association elsewhere)
- Cancel an approved or pending association
- Upload profile photo (Cloudinary)

### Patient
- Two patient types:
  - **Guest/walk-in** — created by a receptionist with just Name + Age (+ optional phone), no login account at all
  - **Self-registered** — full account via `/auth/register`, with Name, Email, Mobile, DOB
- Unified phone-number search across both types
- Self-service profile update (DOB, gender, blood group, address, geolocation)

### Appointment
- Search bookable doctors by name, clinic, city, or clinic+date (returns live queue snapshot)
- Online booking (Patient) — subject to:
  - The doctor's configured booking-window rule (only bookable within N minutes of their `startTime`, N configurable platform-wide by Super Admin)
  - Clinic's working hours / holidays
  - Clinic's online-consultation toggle
- Reception booking (Receptionist/Clinic) for walk-in, phone, or existing patients — bypasses the online booking-window and online-toggle restrictions (but still respects holidays/closed days)
- Fully independent, sequential token counter **per doctor per clinic per day** — online and reception bookings share the same counter
- Patient's own appointment list, with queue detail redacted if the doctor's queue mode is PRIVATE

### Queue
- Full queue lifecycle: Next, Previous, Skip, Recall (specific token), Pause, Resume, Close, Reopen, Emergency token insertion
- All actions logged to an audit trail (`QueueLog`)
- Live updates broadcast via Socket.io, room-scoped per doctor+clinic
- Strict access control: a Receptionist can only control queues for doctors they are specifically assigned to; Clinic/Admin/Super Admin bypass this
- Queue modes: **LIVE** (full visibility) and **PRIVATE** (patients see only their own token + status, not the live position) — **TIME_SLOT** mode is defined in the schema but not yet implemented (deferred)

### Admin
- Approve/reject clinic registrations
- Verify doctors
- List/deactivate any user account
- Platform-wide settings (booking window minutes, etc.)
- Platform stats (total users, clinics, doctors, patients, approval counts)

### Announcement
- Platform-wide announcements (Super Admin/Admin)
- Clinic-specific announcements, optionally tied to a specific doctor (e.g. "Dr. X absent today")
- Live broadcast via Socket.io to clients subscribed to that clinic's room
- Deactivation (Clinic can only deactivate their own; Admin can deactivate any)

### Dashboard
- Doctor dashboard: total clinics, total patients, clinic-wise patient count, today's appointments, upcoming schedule, pending/approved clinic requests
- Clinic dashboard: total/active doctors, pending/approved/rejected doctor requests, today's appointments, queue summary
- Note: dashboards currently reflect real booking data only for a doctor's *primary* clinic; secondary/associated clinics show correctly in lists but patient counts there are not yet wired (flagged in the API response itself)

### Reports
- Daily and monthly clinic reports — JSON or downloadable PDF (`?format=pdf`) — with status breakdown, booking-source breakdown, per-doctor breakdown, and estimated revenue
- Full clinic patient list PDF (Name, Age, Phone) — accessible to Clinic and Receptionist
- Doctor + clinic + date-scoped patient list PDF (Name, Age, DOB, Phone) — strict exact-date matching, includes all booking sources

---

## Folder Structure

```
src/
  app.js                 — Express app setup, middleware, route mounting
  server.js              — HTTP server bootstrap, Socket.io init, graceful shutdown
  config/                — env, db, redis, logger, socket, cloudinary, passport, swagger config
  middlewares/            — auth, role, error, rate limiter, upload, 404 handler
  modules/                — one folder per feature (see Architecture above)
  sockets/                — Socket.io event emitters (queue, announcement)
  utils/                  — ApiError, ApiResponse, asyncHandler, token generator, PDF generator, Cloudinary upload, email service
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

Server runs on the port set in `.env` (`PORT`, e.g. `8000`).

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

**Never commit `.env`.** It's already in `.gitignore`.

---

## Database

- PostgreSQL, hosted on Supabase
- Prisma ORM — schema in `prisma/schema.prisma`
- Migrations tracked in `prisma/migrations/`
- One seed script (`prisma/seed.js`) creates the initial Super Admin account and the single required `PlatformSetting` row

To apply migrations against a fresh database:
```bash
npx prisma migrate deploy
```

---

## Running with Docker

```bash
docker compose up --build
```

This starts the app (port 8000) plus a local Redis container. Postgres is not containerized — it always points at Supabase, even in local Docker development.

---

## Deployment

Deployed on **Render**, connected directly to this GitHub repo — every push to `main` triggers an automatic rebuild from the `Dockerfile`.

- **Database:** Supabase (same as local, or a separate production project — your choice)
- **Redis:** Upstash (free tier), using a `rediss://` (TLS) connection string
- **Environment variables:** set individually in Render's dashboard — never committed to the repo

To deploy elsewhere (Railway, Fly.io, a VPS), the existing `Dockerfile` should work with any Docker-compatible host with minimal changes.

---

## API Documentation

Interactive Swagger UI is available at `/api-docs`, but **only when `NODE_ENV !== "production"`** — it's intentionally disabled in production to avoid exposing the full API surface publicly. Run locally to browse and test every endpoint with request/response schemas and a "Try it out" button.

---

## Security

- Passwords hashed with bcrypt
- Refresh tokens hashed (SHA-256) before storage — never stored in plaintext
- JWT access tokens (short-lived) + refresh tokens (long-lived, rotated on use)
- Role-based access control on every protected route
- Rate limiting: 300 req/15min globally, 10 req/15min on login/register, 5 req/hour on OTP endpoints
- Helmet for security headers (CSP disabled specifically to allow Swagger UI to render — fine for a JSON API with no other HTML pages)
- CORS restricted to `CLIENT_URL`
- Input validation on every endpoint via Zod
- Strict clinic-scoping on receptionist queue access (can only control doctors they're explicitly assigned to)

---

## Known Limitations / Roadmap

Deliberately deferred or left incomplete:

- **No automated tests** — Jest/Supertest were planned but never implemented
- **Time Slot queue mode** — schema field exists (`queueMode: TIME_SLOT`), but booking logic isn't built; only LIVE and PRIVATE modes are functional
- **Prescription module** — skipped; many clinics aren't using digital prescriptions yet
- **Pharmacy module** — skipped, same reasoning
- **Dashboard data for secondary clinics** — a doctor's Doctor/Clinic dashboard only reflects real appointment data for their *primary* clinic; associated/secondary clinics show correctly in lists but patient counts there aren't aggregated yet
- A few empty leftover module folders (`notification/`, unused parts of `user/` and `receptionist/`) exist as scaffolding from early planning — harmless, safe to remove

---

## License

Private project — not currently licensed for public/commercial reuse.
