# Backend-Frontend Integration Contract

> **Platform**: Doctor Management System  
> **Source of Truth**: Backend Codebase (`src/`), Database Schema (`prisma/schema.prisma`), WebSocket Infrastructure (`src/sockets/`)  
> **Target Audience**: AI Coding Agents (Kimi / Antigravity) & Lead Frontend Engineers  
> **Status Tag Legend**:
> - `CONFIRMED FROM BACKEND`: Fully backed by existing backend code, routes, sockets, or Prisma schema.
> - `TO BE CONFIRMED WITH BACKEND TEAM`: Unconfirmed endpoints, schemas, or requirements pending formal backend specification.

---

## 1. Executive Summary

This contract details the exact backend API structure, database models, WebSocket events, security mechanisms, and environment configurations discovered during Phase 0 inspection. Future AI coding agents MUST treat this document as the ground truth reference for all Phase 1–10 frontend implementations.

---

## 2. Express API Module & Endpoint Directory

Backend base URL: `http://localhost:8000/api/v1`

### 2.1 Auth Module (`/api/v1/auth`) — `CONFIRMED FROM BACKEND`
- **File Location**: [src/modules/auth/auth.routes.js](file:///d:/doctor-management-system-backend-soumya_da/src/modules/auth/auth.routes.js)
- **Endpoints**:
  - `POST /api/v1/auth/register`: Self-registration for Patient accounts (`name`, `email`, `password`, `phone`, `dob`).
  - `POST /api/v1/auth/login`: Log in with email & password (`email`, `password`). Returns `accessToken`, sets `refreshToken` cookie.
  - `POST /api/v1/auth/refresh`: Issue new `accessToken` using `refreshToken` cookie.
  - `POST /api/v1/auth/forgot-password`: Request 6-digit password reset OTP (`email`).
  - `POST /api/v1/auth/reset-password`: Reset password using OTP (`email`, `otp`, `newPassword`).
  - `POST /api/v1/auth/logout`: Revoke refresh token and clear cookie (Requires Auth Bearer token).
  - `GET /api/v1/auth/me`: Get current authenticated user profile (Requires Auth Bearer token).
  - `GET /api/v1/auth/google`: Trigger Google OAuth login flow.
  - `GET /api/v1/auth/google/callback`: Google OAuth callback.

### 2.2 Doctor Module (`/api/v1/doctors`) — `CONFIRMED FROM BACKEND`
- **File Location**: `src/modules/doctor/doctor.routes.js`
- **Endpoints**:
  - `GET /api/v1/doctors`: List all doctors (supports query filters: `specialization`, `clinicId`, `search`).
  - `GET /api/v1/doctors/:id`: Get doctor profile details by ID.
  - `GET /api/v1/doctors/schedule`: Get doctor's clinic schedules & working hours (Doctor auth required).
  - `PUT /api/v1/doctors/schedule`: Update doctor's working hours & consultation duration (Doctor auth required).

### 2.3 Patient Module (`/api/v1/patient`) — `CONFIRMED FROM BACKEND`
- **File Location**: `src/modules/patient/patient.routes.js`
- **Endpoints**:
  - `GET /api/v1/patient/profile`: Get patient profile.
  - `PUT /api/v1/patient/profile`: Update patient profile details.
  - `GET /api/v1/patient/my-appointments`: Get patient's appointment history & upcoming tokens.

### 2.4 Receptionist Module (`/api/v1/receptionist`) — `CONFIRMED FROM BACKEND`
- **File Location**: `src/modules/receptionist/receptionist.routes.js`
- **Endpoints**:
  - `GET /api/v1/receptionist/doctors`: List doctors assigned to this receptionist's clinic (`ReceptionistDoctor`).
  - `POST /api/v1/receptionist/walk-in`: Register walk-in patient & issue token slip.
  - `GET /api/v1/receptionist/dashboard`: Summary stats for reception desk.

### 2.5 Appointment Module (`/api/v1/appointments`) — `CONFIRMED FROM BACKEND`
- **File Location**: `src/modules/appointment/appointment.routes.js`
- **Endpoints**:
  - `POST /api/v1/appointments`: Create appointment / acquire token (`doctorId`, `clinicId`, `date`, `bookingSource`).
  - `GET /api/v1/appointments/:id`: Get appointment details by ID.
  - `PUT /api/v1/appointments/:id/status`: Update appointment status (`WAITING`, `CHECKED_IN`, `COMPLETED`, `CANCELLED`, `ABSENT`).

### 2.6 Queue Module (`/api/v1/queue`) — `CONFIRMED FROM BACKEND`
- **File Location**: `src/modules/queue/queue.routes.js`
- **Endpoints**:
  - `GET /api/v1/queue/today`: Get today's active queue for doctor & clinic (`currentToken`, `lastTokenIssued`, `status`).
  - `POST /api/v1/queue/next`: Advance queue to next token number.
  - `PUT /api/v1/queue/status`: Update queue status (`OPEN`, `PAUSED`, `CLOSED`).

### 2.7 Clinic Module (`/api/v1/clinic`) — `CONFIRMED FROM BACKEND`
- **File Location**: `src/modules/clinic/clinic.routes.js`
- **Endpoints**:
  - `GET /api/v1/clinic`: List clinics.
  - `GET /api/v1/clinic/:id`: Get clinic details, attached doctors, working hours (`ClinicWorkingHours`), and holidays (`ClinicHoliday`).

### 2.8 Announcement Module (`/api/v1/announcements`) — `CONFIRMED FROM BACKEND`
- **File Location**: `src/modules/announcement/announcement.routes.js`
- **Endpoints**:
  - `GET /api/v1/announcements`: List active announcements.
  - `POST /api/v1/announcements`: Create platform or clinic announcement (`type`, `title`, `message`, `clinicId`, `doctorId`).

### 2.9 Review Module (`/api/v1/reviews`) — `CONFIRMED FROM BACKEND`
- **File Location**: `src/modules/review/review.routes.js`
- **Endpoints**:
  - `GET /api/v1/reviews`: Get reviews for a doctor.
  - `POST /api/v1/reviews`: Submit review for completed appointment (`appointmentId`, `rating`, `comment`).

### 2.10 Notification Module (`/api/v1/notifications`) — `CONFIRMED FROM BACKEND`
- **File Location**: `src/modules/notification/notification.routes.js`
- **Endpoints**:
  - `GET /api/v1/notifications`: Fetch user notifications.
  - `PUT /api/v1/notifications/:id/read`: Mark notification as read.

### 2.11 Dashboard, Admin, Report, User & Pharmacy Modules — `CONFIRMED FROM BACKEND`
- `GET /api/v1/dashboard`: Dashboard overview data for doctor/clinic.
- `GET /api/v1/admin`: Admin management endpoints.
- `GET /api/v1/reports`: PDF report generation endpoints (`pdfkit`).
- `GET /api/v1/users`: User profile management.

---

## 3. Prisma Entity Schema & Relational Models

Database Provider: **PostgreSQL (Supabase)** via Prisma ORM  
**File Location**: [prisma/schema.prisma](file:///d:/doctor-management-system-backend-soumya_da/prisma/schema.prisma)

### 3.1 Core User & Role Entities — `CONFIRMED FROM BACKEND`
```prisma
enum Role {
  SUPER_ADMIN
  ADMIN
  CLINIC
  RECEPTIONIST
  DOCTOR
  PATIENT
}

enum AuthProvider {
  LOCAL
  GOOGLE
}
```

- **`User` Model**:
  - `id`: String (UUID, PK)
  - `name`: String
  - `email`: String? (Unique)
  - `password`: String? (Hashed with bcrypt)
  - `phone`: String? (Unique)
  - `role`: Role enum
  - `provider`: AuthProvider enum (`LOCAL` or `GOOGLE`)
  - `googleId`: String? (Unique)
  - `avatar`: String? (Cloudinary URL)
  - `isVerified`: Boolean (default: `false`)
  - `isActive`: Boolean (default: `true`)
  - `selfRegistered`: Boolean (default: `true`)

---

### 3.2 Clinical & Staff Entities — `CONFIRMED FROM BACKEND`

- **`Clinic` Model**:
  - `id`: String (UUID, PK)
  - `userId`: String (FK -> User.id)
  - `clinicName`: String
  - `address`, `city`, `state`, `pincode`: String?
  - `latitude`, `longitude`: Float?
  - `logo`: String?
  - `isApproved`: Boolean (default: `false`)
  - `onlineConsultationEnabled`: Boolean (default: `true`)

- **`Doctor` Model**:
  - `id`: String (UUID, PK)
  - `userId`: String (FK -> User.id)
  - `clinicId`: String (FK -> Clinic.id)
  - `specialization`, `qualification`: String?
  - `experience`: Int?
  - `fee`: Float?
  - `isVerified`: Boolean (default: `false`)
  - `queueMode`: QueueMode enum (`LIVE`, `PRIVATE`, `TIME_SLOT`, default: `LIVE`)
  - `startTime`: String?
  - `profilePhoto`: String?
  - `avgConsultationMinutes`: Int? (Used to estimate wait times)

- **`Receptionist` Model**:
  - `id`: String (UUID, PK)
  - `userId`: String (FK -> User.id)
  - `clinicId`: String (FK -> Clinic.id)

- **`ReceptionistDoctor` Model** (Junction Table):
  - Maps which Receptionist can manage which Doctor's queue inside a Clinic.
  - Fields: `receptionistId`, `doctorId`, `clinicId`.

---

### 3.3 Patient & Appointment Entities — `CONFIRMED FROM BACKEND`

- **`Patient` Model**:
  - `id`: String (UUID, PK)
  - `userId`: String? (FK -> User.id, null for walk-in patients without account)
  - `name`: String? (Holds name directly for walk-in patients)
  - `phone`: String? (Holds phone directly for walk-in patients)
  - `dob`: DateTime?
  - `age`: Int?
  - `gender`, `bloodGroup`, `address`: String?
  - `latitude`, `longitude`: Float?

- **`Queue` Model**:
  - `id`: String (UUID, PK)
  - `doctorId`: String (FK -> Doctor.id)
  - `clinicId`: String (FK -> Clinic.id)
  - `date`: DateTime (@db.Date)
  - `currentToken`: Int (default: `0`)
  - `lastTokenIssued`: Int (default: `0`)
  - `status`: QueueStatus enum (`OPEN`, `PAUSED`, `CLOSED`, default: `OPEN`)
  - Unique Constraint: `@@unique([doctorId, clinicId, date])`

- **`Appointment` Model**:
  - `id`: String (UUID, PK)
  - `doctorId`: String (FK -> Doctor.id)
  - `clinicId`: String (FK -> Clinic.id)
  - `patientId`: String (FK -> Patient.id)
  - `queueId`: String (FK -> Queue.id)
  - `token`: Int
  - `date`: DateTime (@db.Date)
  - `status`: AppointmentStatus enum (`WAITING`, `CHECKED_IN`, `ABSENT`, `COMPLETED`, `CANCELLED`, default: `WAITING`)
  - `bookingSource`: BookingSource enum (`ONLINE`, `RECEPTION`, `WALK_IN`, `PHONE`)
  - `isEmergency`: Boolean (default: `false`)
  - Unique Constraint: `@@unique([doctorId, clinicId, date, token])`

---

### 3.4 Auxiliary Entities — `CONFIRMED FROM BACKEND`

- **`Announcement` Model**:
  - Fields: `id`, `type` (`DOCTOR_ABSENT`, `CLINIC_CLOSED`, `HOLIDAY`, `EMERGENCY`, `MAINTENANCE`, `GENERAL`), `title`, `message`, `clinicId`?, `doctorId`?, `createdByUserId`, `isActive`.

- **`DoctorClinicAssociation` Model**:
  - Fields: `id`, `doctorId`, `clinicId`, `fee`, `queueMode`, `dayOfWeek`, `startTime`, `endTime`, `status` (`PENDING`, `APPROVED`, `REJECTED`), `requestedBy`.

- **`ClinicWorkingHours` Model**:
  - Fields: `id`, `clinicId`, `dayOfWeek`, `openTime`, `closeTime`, `isClosed`, `avgConsultationMinutes`.

- **`ClinicHoliday` Model**:
  - Fields: `id`, `clinicId`, `date`, `reason`.

- **`Review` Model**:
  - Fields: `id`, `appointmentId` (Unique), `patientId`, `doctorId`, `clinicId`, `rating` (Int), `comment` (String?), `status` (`PENDING`, `APPROVED`, `REJECTED`).

- **`Notification` Model**:
  - Fields: `id`, `userId`, `type` (`APPOINTMENT_BOOKED`, `APPOINTMENT_CANCELLED`, `CLINIC_APPROVED`, etc.), `title`, `message`, `isRead` (Boolean).

---

## 4. WebSocket System Directory

**Server Configuration**: [src/config/socket.config.js](file:///d:/doctor-management-system-backend-soumya_da/src/config/socket.config.js)

### 4.1 Client Subscriptions (Emitted by Frontend to Server) — `CONFIRMED FROM BACKEND`
- `socket.emit("joinQueue", { doctorId, clinicId })`: Joins Socket room `queue:<doctorId>:<clinicId>`.
- `socket.emit("leaveQueue", { doctorId, clinicId })`: Leaves Socket room `queue:<doctorId>:<clinicId>`.
- `socket.emit("joinAppointment", appointmentId)`: Joins Socket room `appointment:<appointmentId>`.
- `socket.emit("leaveAppointment", appointmentId)`: Leaves Socket room `appointment:<appointmentId>`.

### 4.2 Server Broadcast Events (Received by Frontend) — `CONFIRMED FROM BACKEND`

| Socket Module File | Event Name | Room Target | Trigger Description |
| :--- | :--- | :--- | :--- |
| `src/sockets/queue.socket.js` | `queueUpdate` | `queue:<doctorId>:<clinicId>` | Fired when queue status or last token changes. |
| `src/sockets/queue.socket.js` | `tokenCalled` | `queue:<doctorId>:<clinicId>` | Fired when doctor calls next token number. |
| `src/sockets/queue.socket.js` | `appointmentCompleted` | `queue:<doctorId>:<clinicId>` | Fired when consultation is marked completed. |
| `src/sockets/notification.socket.js` | `appointmentNotification` | `appointment:<appointmentId>` | Direct alert sent to specific patient holding this appointment. |
| `src/sockets/announcement.socket.js` | `announcement` | Platform-Wide (Global `io.emit`) | System-wide notice from Super Admin. |
| `src/sockets/announcement.socket.js` | `announcement` | Clinic Room (`clinic:<clinicId>`) | Clinic-specific emergency or absence notice. |

---

## 5. Backend Zod Validation Architecture — `CONFIRMED FROM BACKEND`

Backend modules contain dedicated validation files:
- `src/modules/auth/auth.validation.js`
- `src/modules/appointment/appointment.validation.js`
- `src/modules/queue/queue.validation.js`
- `src/modules/clinic/clinic.validation.js`
- `src/modules/doctor/doctor.validation.js`
- `src/modules/patient/patient.validation.js`
- `src/modules/review/review.validation.js`
- `src/modules/notification/notification.validation.js`
- `src/modules/announcement/announcement.validation.js`

Validation Error Format (Handled in `src/middlewares/error.middleware.js`):
When a request fails Zod validation, the backend responds with HTTP `400 Bad Request`:
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address format"
    }
  ]
}
```

---

## 6. Environment Configuration Variables Map — `CONFIRMED FROM BACKEND`

From [.env.example](file:///d:/doctor-management-system-backend-soumya_da/.env.example) and `src/config/env.config.js`:

### Frontend Variables (Consumed by `apps/patient-web` & `apps/staff-dashboard`):
- `NEXT_PUBLIC_API_URL`: Backend REST API base URL (Default: `http://localhost:8000/api/v1`).
- `NEXT_PUBLIC_SOCKET_URL`: Socket.io server base URL (Default: `http://localhost:8000`).

### Backend Environment Context (Architectural Knowledge Only):
- `PORT`: Express server port (Default: `8000`).
- `DATABASE_URL`: PostgreSQL connection string (Supabase).
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: Secret keys for JWT verification.
- `CLIENT_URL`: Allowed CORS origin (Default: `http://localhost:3000`).

---

## 7. Unknowns & Backend Clarification Register

The following items cannot be fully verified from the current backend static code and are logged as:  
`TO BE CONFIRMED WITH BACKEND TEAM`:

1. **Exact Super Admin Route Permissions**: Confirmation of whether Admin dashboard shares `apps/staff-dashboard` or uses dedicated role routes (`TO BE CONFIRMED WITH BACKEND TEAM`).
2. **Prescription Model**: A `src/modules/prescription` directory exists in backend, but `Prescription` model is not present in current `prisma/schema.prisma` (`TO BE CONFIRMED WITH BACKEND TEAM`).
3. **Payment Gateway Integration**: Online consultation fee payment processing endpoints (`TO BE CONFIRMED WITH BACKEND TEAM`).
