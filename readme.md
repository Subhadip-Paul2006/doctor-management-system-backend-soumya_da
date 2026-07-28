# 🩺 MedConnect — Doctor & Clinic Management Backend

A REST API backend for a multi-clinic doctor appointment and **live patient queue** system. Handles multi-role access (Super Admin, Admin, Clinic, Receptionist, Doctor, Patient), real-time queue updates, appointment booking, and clinic operations.

> ⚠️ This README replaces an older draft that described a MongoDB/Mongoose version of this project. The codebase has since moved to **PostgreSQL + Prisma**; this document matches what's actually in `main` today.

---

## 🛠 Tech Stack

| Layer | Tools |
|---|---|
| Runtime / Framework | Node.js, Express 5 |
| Database / ORM | PostgreSQL, Prisma |
| Real-time | Socket.io |
| Caching / OTP store | Redis (ioredis) |
| Auth | JWT (access + refresh), HTTP-only cookies, Google OAuth (Passport) |
| Validation | Zod |
| Security middleware | Helmet, CORS, express-rate-limit, cookie-parser |
| File uploads | Multer, Cloudinary |
| Email | Nodemailer |
| PDF generation | PDFKit |
| Docs | Swagger (swagger-jsdoc + swagger-ui-express) at `/api-docs` |
| Logging | Pino |

---

## 📂 Project Structure

```
src/
├── app.js               # Express app, middleware wiring, route mounting
├── server.js             # HTTP server bootstrap
├── config/               # env, db, redis, passport, swagger, socket config
├── middlewares/           # auth, role guard, rate limiter, error handling
├── sockets/               # Socket.io queue event emitters
├── modules/
│   ├── auth/              # register, login, refresh, OTP reset, Google OAuth
│   ├── clinic/             # clinic profile, approval, working hours, holidays
│   ├── doctor/             # doctor profile, schedule
│   ├── receptionist/        # receptionist ↔ doctor assignment (partial)
│   ├── admin/              # platform-wide admin controls
│   ├── patient/            # guest + self-registered patients
│   ├── appointment/         # booking (online/reception/walk-in)
│   ├── queue/              # live token queue: next/prev/skip/recall/pause/close/emergency
│   ├── announcement/         # clinic/doctor/platform-wide broadcasts
│   ├── dashboard/           # aggregate stats
│   ├── report/              # PDF report generation
│   ├── notification/         # empty stub — not implemented
│   ├── prescription/         # explicitly out of scope for this project
│   └── pharmacy/            # explicitly out of scope for this project
prisma/
├── schema.prisma          # full data model
└── seed.js
```

---

## 🚀 Local Setup

```bash
git clone https://github.com/soumya28022005/doctor-management-system-backend.git
cd doctor-management-system-backend
npm install
```

### 1. Create a `.env` file in the project root

```env
NODE_ENV=development
PORT=5000

# Postgres (Prisma)
DATABASE_URL=postgresql://user:password@host:5432/dbname
DIRECT_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_ACCESS_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_a_different_long_random_string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis (used for OTP storage)
REDIS_URL=redis://localhost:6379

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Email (Nodemailer / SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Frontend origin (for CORS + cookies)
CLIENT_URL=http://localhost:5173
```

### 2. Run database migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 3. (Optional) Seed the database

```bash
node prisma/seed.js
```

### 4. Run the server

```bash
npm run dev     # development, with nodemon
npm start       # production
```

The API runs on `http://localhost:<PORT>`, health check at `GET /api/v1/health`, interactive API docs at `GET /api-docs`.

---

## 🔐 Auth Flow

- Register/login issue a short-lived **access token** (returned in the response body) and a longer-lived **refresh token** (set as an HTTP-only cookie).
- `POST /api/v1/auth/refresh` rotates the access token using the refresh cookie.
- `POST /api/v1/auth/forgot-password` / `reset-password` use a Redis-stored OTP emailed to the user, rate-limited separately from general traffic.
- Google OAuth available at `GET /api/v1/auth/google`.

Roles: `SUPER_ADMIN`, `ADMIN`, `CLINIC`, `RECEPTIONIST`, `DOCTOR`, `PATIENT`.

---

## 📌 Main API Routes

All routes are prefixed `/api/v1`.

| Module | Base path |
|---|---|
| Auth | `/auth` |
| Clinic | `/clinic` |
| Receptionist | `/receptionist` |
| Admin | `/admin` |
| Patient | `/patient` |
| Appointments | `/appointments` |
| Queue | `/queue` |
| Announcements | `/announcements` |
| Doctors | `/doctors` |
| Dashboard | `/dashboard` |
| Reports | `/reports` |

Full request/response schemas are documented at `/api-docs` (Swagger).

---

## ✅ Status

### Working
- Auth (register/login/refresh/logout, OTP password reset, Google OAuth)
- RBAC across all 6 roles
- Clinic/doctor/receptionist management, admin approval workflow
- Guest and self-registered patients
- Appointment booking (online, reception, walk-in)
- Queue controls (next, previous, skip, recall, pause, resume, close, reopen, emergency) with audit logs
- Rate limiting (general + auth + OTP-specific)
- Live announcements over Socket.io
- Swagger docs at `/api-docs`

### Known issues / in progress
- **Queue lookups have a parameter-order bug**: `queue.service.js` calls repository functions without the `clinicId` argument they require, so `date` and `clinicId` get mismatched. This needs fixing before the queue endpoints can be trusted in production.
- **Refresh tokens are stored in plaintext** in the database; should be hashed before storage.
- Doctor–clinic relationship is still schema-level 1:1 (`Doctor.clinicId`), while `DoctorClinicAssociation` (built for multi-clinic doctors) exists but isn't wired into the doctor model yet.
- `queueMode` (LIVE/PRIVATE/TIME_SLOT) exists on the schema but all queues currently behave as LIVE only.
- Clinic working-hours/holiday tables exist in the schema but aren't yet exposed/enforced via API logic.
- Reporting module (daily/monthly PDF exports) is partially built.
- No automated tests yet (no Jest/Supertest despite being an intended part of the stack).
- No Dockerfile / docker-compose yet.

### Explicitly out of scope
- Prescription module
- Pharmacy module

### Future scope
- SMS/WhatsApp OTP delivery
- Telemedicine, payments, insurance, lab integration
- AI features, multi-branch support, localization

---

## 👨‍💻 Author

Soumya Chatterjee — [GitHub](https://github.com/soumya28022005)

## 📄 License

MIT