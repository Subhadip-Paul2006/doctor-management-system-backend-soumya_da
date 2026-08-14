# Doctor & Clinic Management System (Monorepo)

This repository is organized as an **`apps/` + `packages/` monorepo layout**, housing the complete multi-tenant Doctor & Clinic Management System, including the Express/Prisma backend, patient web portal, staff dashboard, and shared TypeScript libraries.
# Jeet Backend — Doctor Appointment & Clinic Management System

A production-grade backend for a multi-clinic, multi-role healthcare appointment, queue, and diagnostic-referral platform. Built with Node.js, Express, Prisma, PostgreSQL (Supabase), Redis, and Socket.io.

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
| File Storage | Cloudinary (profile photos, clinic/diagnostic-center logos, avatars) |
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

Eight roles share a single `User` table, with role-specific profile tables:

- **SUPER_ADMIN** — platform owner. Manages global settings (booking window, etc.), creates Admin and Clinic accounts.
- **ADMIN** — approves clinics and diagnostic centers, verifies doctors, manages users, moderates reviews, creates Clinic/Diagnostic Center accounts. Cannot touch platform-wide settings — that's Super Admin only.
- **CLINIC** — manages its own doctors, receptionists, working hours, holidays, announcements, referrals sent.
- **RECEPTIONIST** — manages assigned doctors' queues (strictly per-clinic-scoped), books walk-in/phone appointments.
- **DOCTOR** — global profile, can work at multiple clinics via approved associations, sets own leave/consultation time.
- **PATIENT** — books appointments, views queue status, submits reviews, receives test referrals, manages own profile.
- **DIAGNOSTIC_CENTER** — receives and manages incoming test referrals; manages its own profile, logo, and staff accounts.
- **DIAGNOSTIC_STAFF** — created by a Diagnostic Center; views incoming referrals at that center.

**Public self-registration (`POST /auth/register`) is Patient-only.** Clinic and Diagnostic Center accounts are created exclusively by Super Admin or Admin (auto-approved). Doctor and Receptionist accounts are created by a Clinic; Diagnostic Staff accounts are created by a Diagnostic Center. Admin accounts are created exclusively by Super Admin.

---

## Features by Module

### Auth
- Register (Patient-only) / login (JWT access + refresh tokens)
- Refresh token rotation, refresh tokens are SHA-256 hashed at rest
- Logout, forgot/reset password via email OTP — restricted to self-registered accounts only
- Google OAuth login — **Patient accounts only**, all other roles rejected with a clear error
- Role-based access control (RBAC) middleware on every protected route

### Clinic
- Profile management, logo upload
- Create Doctor and Receptionist accounts
- Assign receptionists to doctors, scoped per-clinic (isolates access when a doctor also works at another clinic)
- Change Doctor/Receptionist password (staff cannot change their own)
- Configure working hours, holidays, online-consultation toggle
- Approve/reject incoming doctor connection requests (multi-clinic)
- Send test referrals to Diagnostic Centers; view referrals sent

### Doctor (Multi-Clinic)
- Global profile, independent of any single clinic
- Search/connect with clinics, schedule-conflict-checked approvals (Serializable transaction, race-condition safe)
- Cancel associations; upload profile photo
- Set average consultation minutes per clinic (drives patient wait-time estimates) — editable by Doctor, Clinic, assigned Receptionist, or Admin
- Mark self on leave for a specific date/clinic (blocks both online and reception booking that day)
- Send a "running late" delay notification to today's waiting patients

### Patient
- Guest/walk-in (no login account) and self-registered patient types, unified phone search
- Self-service profile update
- Receives live + persisted notifications for every relevant event
- Submits reviews after a completed appointment

### Appointment
- Search bookable doctors by name/clinic/city/date
- Online booking — booking-window rule, clinic hours/holidays, online-toggle, doctor-leave check
- Reception booking — bypasses online-only restrictions, still respects holidays/leave; strictly access-scoped (Receptionist/Clinic can only book within their own assignment)
- Fully independent sequential token counter per doctor per clinic per day, shared across all booking sources
- **Cancel** — Patient can cancel their own WAITING appointment; Receptionist/Clinic/Admin can cancel at their scope
- **Reschedule** — cancels the old slot (with reason logged) and books a fresh token on the new date
- Live `patientsAhead` and `estimatedWaitMinutes` on the patient's own appointment list
- Queue detail redacted if the doctor's queue mode is PRIVATE

### Queue
- Full lifecycle: Next, Previous, Skip, Recall, Pause, Resume, Close, Reopen, Emergency token
- Audit trail (`QueueLog`) on every action
- Live Socket.io broadcast per doctor+clinic room, plus `tokenCalled`/`appointmentCompleted` events
- Strict per-clinic-scoped receptionist access control
- LIVE and PRIVATE queue modes functional; TIME_SLOT is schema-only

### Notifications
- Persisted, database-backed inbox — list, unread count, mark read/all-read
- **Live** via Socket.io (`user:<id>` room) — every notification-producing action across the entire app pushes instantly, not just on next poll
- Auto-fired on: appointment booked/cancelled/rescheduled, token called, consultation complete, doctor delay, test referral created (to both patient and diagnostic center)
- `notifyUser()` never throws — a failed notification never blocks the action that triggered it

### Reviews & Feedback
- 1–5 star rating + written review, tied to a specific completed appointment (one per appointment)
- Starts PENDING, invisible publicly until Admin approves
- Live-computed average rating per doctor and per clinic
- Report-as-inappropriate flow; Admin moderation queue for pending and reported reviews

### Diagnostic Centers & Test Referrals
- Diagnostic Centers are a parallel entity to Clinics — own profile, logo, staff accounts, Admin-only creation/approval
- Doctor, Receptionist, or Clinic can create a **Test Referral**: one or more tests, optional notes, targeting a specific Diagnostic Center
- Referring clinic is auto-resolved from the creator's context
- Diagnostic Center (and its staff) see incoming referrals with full patient name, address, phone, referred test(s), referring clinic, and who created it
- Referring clinic sees its sent referrals; patient sees their own; Admin/Super Admin see everything for audit
- Both the patient and the diagnostic center receive live + persisted notifications on referral creation

### Admin
- Approve/reject clinics and diagnostic centers; create either directly (auto-approved)
- Verify doctors; list/deactivate any user account
- Create Admin accounts (Super Admin only)
- Platform-wide settings (Super Admin only — Admin is explicitly blocked)
- Platform stats; update any Doctor's photo, Clinic/Diagnostic Center's logo, or any user's avatar

### Announcement
- Platform-wide (Super Admin/Admin) and clinic-specific (optionally doctor-tied) announcements
- Live Socket.io broadcast; deactivation scoped by role

### Dashboard
- Doctor and Clinic dashboards (totals, requests, today's appointments, queue summary)
- Note: dashboard patient/appointment data currently reflects only a doctor's *primary* clinic

### Analytics
- **Daily Dashboard** — today's (or any date's) total/new/returning patients, status breakdown, doctor-wise counts, live queue summary
- **Growth Trend** — daily/weekly/monthly/yearly bucketed new-vs-returning patient counts over a date range, with period-over-period growth-rate %
- New-vs-returning is computed live: a patient is "new" on the date of their earliest-ever appointment at that clinic, "returning" otherwise

### Reports
- Daily, weekly, monthly, yearly, and custom-range clinic reports — JSON, PDF, or Excel
- Status/booking-source/per-doctor breakdown, estimated revenue
- Full clinic patient-list PDF and doctor+clinic+exact-date-scoped patient-list PDF
- All downloadable filenames are prefixed with the sanitized clinic name (e.g. `City_Health_Center_daily-report_2026-08-11.pdf`)

---

## Folder Structure

```
src/
  app.js                 — Express app setup, middleware, route mounting
  server.js              — HTTP server bootstrap, Socket.io init, graceful shutdown
  config/                — env, db, redis, logger, socket, cloudinary, passport, swagger config
  middlewares/            — auth, role, error, rate limiter, upload, 404 handler
  modules/                — auth, clinic, doctor, patient, appointment, queue, admin,
                              announcement, dashboard, analytics, report, review,
                              notification, diagnosticCenter, testReferral, user
  sockets/                — Socket.io event emitters (queue, announcement, notification)
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

## 🏗️ Monorepo Architecture Overview

```text
.
├── apps/
│   ├── patient-web/         # Next.js App Router: Public Marketing & Patient Portal
│   └── staff-dashboard/     # Next.js App Router: Multi-Role Staff Portal (Super Admin, Admin, Clinic, Doctor, Receptionist)
│
├── packages/
│   ├── api-client/          # Shared typed HTTP (Axios/Fetch) & Socket.io client
│   ├── types/               # Shared TypeScript domain types & API contracts
│   ├── ui/                  # Shared Tailwind CSS UI component library
│   ├── utils/               # Shared helper routines & date/token formatters
│   └── config/              # Shared ESLint, Tailwind, and TypeScript configurations
│
├── prisma/                  # Prisma ORM Database Schema & Migration files
├── src/                     # Express.js REST API & WebSocket Backend server
├── basics.md                # Comprehensive backend technical documentation
├── docker-compose.yml       # Docker Compose setup for App & Redis
├── Dockerfile               # Node.js Alpine production container definition
├── package.json             # Root npm workspaces manifest
└── turbo.json               # Turbo repo build pipeline configuration
```

---

## 👥 Role & Application Mapping

The system supports **6 Backend Roles** mapped across two dedicated Next.js applications:

### 1. `apps/patient-web` (Public Site & Patient Portal)
- **Role**: `PATIENT` & Guest Visitors.
- **Routes**:
  - `(public)`: Public marketing homepage, doctor directory, clinic search, announcements.
  - `(auth)`: Patient registration, authentication, password recovery.
  - `(patient)`: Protected patient portal for booking appointments, tracking live queue positions, viewing e-prescriptions, managing family profiles, and submitting clinic reviews.

### 2. `apps/staff-dashboard` (Staff Operations Portal)
- **Roles**: `SUPER_ADMIN`, `ADMIN`, `CLINIC`, `DOCTOR`, `RECEPTIONIST`.
- **Role-Gated Route Groups**:
  - `(auth)`: Staff authentication portal & multi-role login.
  - `(super-admin)`: Global platform parameters, administrative account control.
  - `(admin)`: Clinic approvals, doctor verification, system-wide announcements.
  - `(clinic)`: Clinic profile, operating hours, holiday schedules, staff assignments.
  - `(doctor)`: Live queue management (`LIVE`, `PRIVATE`, `TIME_SLOT`), patient visit completion, e-prescription generation, consultation fees.
  - `(receptionist)`: Front-desk live queue desk (`QueueDeskClient`), walk-in token issuance (`WalkInRegistration`), manual patient registration.

---

## 📦 Shared Packages (`packages/`)

- **`@doctor/api-client`**: Pre-configured typed client for consuming REST APIs and subscribing to live Socket.io queue events (`joinQueue`, `tokenUpdated`).
- **`@doctor/types`**: Shared TypeScript interfaces matching Prisma models (`User`, `Clinic`, `Doctor`, `Patient`, `Appointment`, `Queue`, `Prescription`).
- **`@doctor/ui`**: Reusable design system components styled with Tailwind CSS.
- **`@doctor/utils`**: Date/time formatters, estimated wait time calculators, and data transformation functions.
- **`@doctor/config`**: Base presets for ESLint rules, Tailwind themes, and TSConfig settings.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- Docker & Docker Compose (optional)

### Setup & Installation

1. **Install Workspace Dependencies**:
   ```bash
   npm install
   ```

2. **Backend Development Server**:
   ```bash
   npm run dev
   ```
Interactive Swagger UI at `/api-docs` — **only available when `NODE_ENV !== "production"`**, intentionally disabled in production.

---

## Security

- Passwords hashed with bcrypt
- Refresh tokens hashed (SHA-256) before storage — never stored in plaintext
- JWT access tokens (short-lived) + rotated refresh tokens
- Strict, per-clinic-scoped role-based access control — a Receptionist's doctor assignment (and their reception-booking access) is specific to one clinic, preventing cross-clinic privilege escalation when a doctor works at multiple locations
- Rate limiting: 300 req/15min globally, 10 req/15min on login/register, 5 req/hour on OTP endpoints
- Helmet security headers (CSP disabled specifically to allow Swagger UI to render)
- CORS restricted to `CLIENT_URL`
- Input validation on every endpoint via Zod
- Google OAuth restricted to Patient accounts only

---

## Known Limitations / Roadmap

Deliberately deferred:

- **No automated test suite** — Jest/Supertest planned but not implemented
- **Time Slot queue mode** — schema field exists, booking logic isn't built
- **Prescription and Pharmacy modules** — out of scope for this version
- **AI-assisted features** — out of scope
- **SMS/WhatsApp notifications** — in-app/Socket.io notifications used instead, avoiding a paid third-party dependency
- **Real payment gateway** — any future Billing module is planned as record-keeping only (mark paid/unpaid), not live payment processing
- **Dashboard data for secondary clinics** — Doctor/Clinic dashboards only reflect real appointment data for a doctor's *primary* clinic
- **Follow-up module, Staff Activity Log, automated reminders, data export** — scoped and planned, deprioritized for now
- A leftover unused `TestRecommendation` model sits in the schema (superseded by `TestReferral`) — harmless, cleanup migration pending,
- Peak Hour, Avg Waiting Time, Follow-up not done

---

3. **Frontend Applications (Turbo)**:
   ```bash
   npm run dev:frontend
   ```

4. **Prisma Database Commands**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```