# Frontend Monorepo Architecture Blueprint

> **Platform**: Doctor Management System  
> **Target Audience**: AI Coding Agents (Kimi / Antigravity) & Lead Frontend Engineers  
> **Tech Stack**: Next.js App Router, Pure JavaScript (`.js` / `.jsx`), Tailwind CSS, Zod  

---

## 1. Monorepo Structure & Application Boundaries

The project architecture strictly organizes frontend code into `apps/` and `packages/`, leaving backend folders (`src/`, `prisma/`) completely protected and untouched.

```
doctor-management-system/
│
├── apps/
│   ├── patient-web/          <-- Next.js App Router (Port 3000): Public marketing & Patient portal
│   └── staff-dashboard/      <-- Next.js App Router (Port 3001): Shared Doctor, Receptionist & Admin
│
├── packages/
│   ├── api-client/           <-- Centralized HTTP & Socket.io client abstraction
│   ├── config/               <-- Shared Tailwind presets, ESLint, & env resolution
│   ├── types/                <-- Shared Zod schemas, data contracts & JS constants
│   ├── ui/                   <-- Shared atomic UI component library (Button, Card, Modal, etc.)
│   └── utils/                <-- Generic helper utilities (date formatters, cn class merging)
│
├── docs/                     <-- Phase 0 Architectural Documentation (THIS DIRECTORY)
│
├── prisma/                   <-- PROTECTED BACKEND DATABASE SCHEMA
├── src/                      <-- PROTECTED BACKEND EXPRESS API & SOCKETS
├── Dockerfile                <-- PROTECTED INFRASTRUCTURE
├── docker-compose.yml        <-- PROTECTED INFRASTRUCTURE
├── package.json              <-- ROOT WORKSPACE CONFIG
└── turbo.json                <-- TURBO PIPELINE CONFIG
```

### Application Boundaries:

1. `apps/patient-web`:
   - **User Audience**: Public visitors, self-registered patients.
   - **Port**: `3000`
   - **Key Routes**: `/` (Home), `/doctors` (Search), `/doctors/[id]` (Profile), `/clinics` (Clinics), `/book/[id]` (Booking), `/dashboard` (Patient portal), `/appointments` (History).

2. `apps/staff-dashboard`:
   - **User Audience**: Doctors, Receptionists, Clinic Staff, Super Admins.
   - **Port**: `3001`
   - **Key Routes**:
     - Doctor Views: `/doctor/dashboard`, `/doctor/queue`, `/doctor/schedule`, `/doctor/patients`.
     - Receptionist Views: `/receptionist/dashboard`, `/receptionist/walk-in`, `/receptionist/queue`.
     - Admin Views: `/admin/clinics`, `/admin/users`, `/admin/announcements`.
   - **Architectural Note**: Doctor and Receptionist functionality MUST share `apps/staff-dashboard` using Next.js App Router route groups (`(doctor)`, `(receptionist)`, `(admin)`) and role-based route guards. DO NOT create separate applications for doctor and receptionist.

---

## 2. Conceptual Data & Realtime Flow

### 2.1 Request / Response Flow (HTTP REST)

```
+-----------------------------------------------------------------------------------+
|                                 USER INTERFACE                                    |
|             (React Page / Component in apps/patient-web or staff-dashboard)       |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                               APPLICATION LOGIC                                   |
|                (Form Handlers, React Context, State Hooks, Zod Validation)        |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                                API CLIENT PACKAGE                                 |
|                       (@doctor/api-client / http-client.js)                       |
|   - Attaches `Authorization: Bearer <token>`                                      |
|   - Handles 401 token refresh via `/api/v1/auth/refresh`                           |
|   - Normalizes standard JSON responses                                            |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                                BACKEND EXPRESS API                                |
|                        (Running on http://localhost:8000/api/v1)                  |
+-----------------------------------------------------------------------------------+
```

---

### 2.2 Realtime Event Flow (Socket.io)

```
+-----------------------------------------------------------------------------------+
|                                BACKEND SOCKET SYSTEM                              |
|           (src/config/socket.config.js & src/sockets/*.socket.js)                 |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                               SOCKET CLIENT PACKAGE                               |
|                      (@doctor/api-client / socket-client.js)                      |
|   - Connects to Socket.io server at `NEXT_PUBLIC_SOCKET_URL`                      |
|   - Emits `joinQueue`, `leaveQueue`, `joinAppointment`, `leaveAppointment`        |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                             FRONTEND STATE & UI LAYER                             |
|   - Listens for `queueUpdate`, `tokenCalled`, `appointmentCompleted`              |
|   - Triggers live UI updates, audio chimes, and push toasts across screens       |
+-----------------------------------------------------------------------------------+
```

---

## 3. Package Responsibilities

### 3.1 `@doctor/ui`
- Contains ONLY reusable, atomic UI primitives (`Button`, `Input`, `Card`, `Badge`, `Avatar`, `Modal`, `Table`, `Tabs`, `Spinner`, `Skeleton`, `Alert`).
- Written in pure JavaScript / JSX (`.jsx`).
- Styled using Tailwind CSS classes.
- **STRICT RULE**: NO domain business logic or full-page views (`DoctorDashboard`, `PatientDashboard`, `ReceptionDashboard`) inside `@doctor/ui`.

### 3.2 `@doctor/api-client`
- Centralized API communication package.
- Exports instantiated `httpClient` and `socketClient`.
- Exports modular service methods (`authService`, `doctorService`, `patientService`, `appointmentService`, `queueService`, `clinicService`, `announcementService`).
- **STRICT RULE**: Individual UI components must NEVER write scattered raw `fetch()` calls. All backend interactions MUST go through `@doctor/api-client`.

### 3.3 `@doctor/types`
- Shared JS data structure definitions and Zod validation schemas.
- Exports validation schemas for authentication, appointment booking, walk-in registration, and doctor schedule updates.

### 3.4 `@doctor/config`
- Shared Tailwind CSS preset (`packages/config/tailwind/tailwind.config.js`).
- Shared environment variable resolution logic.

### 3.5 `@doctor/utils`
- Common generic utility functions:
  - `date.js`: Date formatting (`formatDate`, `formatTime`, `formatDuration`).
  - `formatters.js`: Currency formatting (`formatFee`), token formatting (`formatTokenNumber`).
  - `cn.js`: Utility helper for combining Tailwind classes cleanly.

---

## 4. Authentication & Role-Based Access Architecture

### 4.1 Authentication State Strategy
- **Access Token**: Short-lived JWT (15 mins) received upon login. Managed in-memory via frontend Auth Context (`AuthProvider.jsx`). Passed in `Authorization: Bearer <token>` header for all HTTP requests.
- **Refresh Token**: Long-lived JWT (7 days) stored in HttpOnly cookie by backend. Automatically sent by browser on `/api/v1/auth/refresh` when access token expires.
- **User Object**: User details (`id`, `name`, `email`, `role`, `clinic`, `doctor`, `receptionist`, `patient`) fetched via `GET /api/v1/auth/me`.

### 4.2 Role-Based Routing Matrix

| Role | Allowed App | Allowed Routes | Unallowed Route Action |
| :--- | :--- | :--- | :--- |
| `PATIENT` | `apps/patient-web` | `/dashboard/*`, `/appointments/*`, `/book/*` | Redirect to `/login` |
| `DOCTOR` | `apps/staff-dashboard` | `/doctor/*` | Redirect to `/login` |
| `RECEPTIONIST` | `apps/staff-dashboard` | `/receptionist/*` | Redirect to `/login` |
| `SUPER_ADMIN` / `ADMIN` | `apps/staff-dashboard` | `/admin/*`, `/doctor/*`, `/receptionist/*` | Redirect to `/login` |

---

## 5. Zod Validation Architecture

Zod is a foundational technology choice for the frontend. Zod will be utilized for:
1. **Form Input Validation**: Pre-submission validation on login, patient registration, walk-in registration, and schedule configuration.
2. **Environment Variable Validation**: Validating required frontend environment variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`) on app startup.
3. **API Response Schema Validation**: Validating crucial API payloads before updating critical UI state.

---

## 6. Strict Backend Protection & Non-Disruption Rules

1. **NO Backend Modifications**: Under no circumstances should frontend development modify files inside `src/` or `prisma/`.
2. **NO Infrastructure Changes**: Do NOT modify `docker-compose.yml`, `Dockerfile`, or database connection logic.
3. **NO Database Mutations**: The Prisma schema belongs to the backend team. Do not add, rename, or delete database models or enums.
4. **Clean Workspace Co-existence**: The backend Express server runs on port `8000`. The frontend applications run on ports `3000` (`patient-web`) and `3001` (`staff-dashboard`).
