# Frontend Development Roadmap

> **Platform**: Doctor Management System  
> **Target Audience**: AI Coding Agents (Kimi / Antigravity) & Lead Frontend Engineers  
> **Stack Standard**: Next.js App Router, Pure JavaScript (`.js` / `.jsx`), Tailwind CSS, Zod  
> **Status Tag Legend**:
> - `COMPLETED BY THIS TASK`: Delivered during Phase 0 reconnaissance and architecture design.
> - `FUTURE IMPLEMENTATION`: Scheduled for execution in subsequent Vibe Coding phases.

---

## Overview

This roadmap defines the multi-phase frontend implementation plan for the Doctor Management Platform. The monorepo architecture separates patient-facing features (`apps/patient-web`) from staff workflows (`apps/staff-dashboard`), supported by shared internal packages (`packages/*`).

```
                              ROOT MONOREPO
                                    │
               ┌────────────────────┴────────────────────┐
               │                                         │
       apps/patient-web                        apps/staff-dashboard
       (Port 3000)                             (Port 3001)
       Patients & Public                       Doctor, Receptionist, Admin
               │                                         │
               └────────────────────┬────────────────────┘
                                    │
                             SHARED PACKAGES
                                    │
       ┌───────────────┬────────────┼────────────┬──────────────┐
       │               │            │            │              │
 @doctor/ui    @doctor/api-client @doctor/types @doctor/config @doctor/utils
```

---

## Phase Summary Table

| Phase | Title | Primary Responsibility | Target Directory | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 0** | Repository Reconnaissance & Documentation | Inspect backend, sockets, database, and produce architecture specs | `docs/` | `COMPLETED BY THIS TASK` |
| **Phase 1** | Frontend Monorepo Foundation | Clean workspace linkage, Next.js JS app router scaffold & baseline packages | `apps/*`, `packages/*` | `FUTURE IMPLEMENTATION` |
| **Phase 2** | Design System Implementation | Reusable UI primitives in `@doctor/ui` inspired by Zoom Doctor | `packages/ui` | `FUTURE IMPLEMENTATION` |
| **Phase 3** | Shared Layouts & Navigation | App-level shell layouts, headers, footers, sidebars, and navigation | `apps/*` | `FUTURE IMPLEMENTATION` |
| **Phase 4** | Public Patient Experience | Public doctor search, doctor profile, clinic profile, landing page | `apps/patient-web` | `FUTURE IMPLEMENTATION` |
| **Phase 5** | Patient Application | Patient dashboard, appointment history, live queue tracker, reviews | `apps/patient-web` | `FUTURE IMPLEMENTATION` |
| **Phase 6** | Doctor Dashboard Application | Doctor queue controller, consultation view, daily schedule, profile | `apps/staff-dashboard` | `FUTURE IMPLEMENTATION` |
| **Phase 7** | Receptionist Dashboard Application | Walk-in patient registration, token generator, chamber queue controller | `apps/staff-dashboard` | `FUTURE IMPLEMENTATION` |
| **Phase 8** | Authentication & Role-Based Access | JWT auth state, token refresh flow, protected route guards, role authorization | `apps/*`, `packages/api-client` | `FUTURE IMPLEMENTATION` |
| **Phase 9** | API & Zod Integration | Connect HTTP client to Express backend routes, attach Zod form schemas | `packages/api-client`, `apps/*` | `FUTURE IMPLEMENTATION` |
| **Phase 10** | Realtime + QA + Production Polish | Connect Socket.io for live queue/token updates, notifications & announcements | `apps/*`, `packages/api-client` | `FUTURE IMPLEMENTATION` |

---

## Phase Details

### Phase 0: Repository Reconnaissance & Documentation
- **Status**: `COMPLETED BY THIS TASK`
- **Objective**: Perform exhaustive static analysis of the backend codebase (`src/`), database schema (`prisma/schema.prisma`), WebSocket infrastructure (`src/sockets/`), environment configuration (`.env.example`), and design reference ([Zoom Doctor](https://www.zoomdoctor.in/)).
- **Scope**:
  - Map all 16 Express API modules and route prefixes.
  - Map all 16 Prisma models, 11 enums, and relationships.
  - Map all Socket.io rooms (`queue:<doctorId>:<clinicId>`, `appointment:<id>`, `clinic:<id>`) and events (`queueUpdate`, `tokenCalled`, `appointmentCompleted`, `appointmentNotification`, `announcement`).
  - Create the 6 core architectural documentation files inside `docs/`.
- **Deliverables**:
  - `docs/FRONTEND_ROADMAP.md`
  - `docs/UI_INVENTORY.md`
  - `docs/USER_FLOWS.md`
  - `docs/DESIGN_SYSTEM.md`
  - `docs/FRONTEND_ARCHITECTURE.md`
  - `docs/BACKEND_FRONTEND_CONTRACT.md`
- **Definition of Done**: All 6 documentation files written cleanly to `docs/` with zero modifications to backend files (`src/`, `prisma/`, `docker-compose.yml`, `Dockerfile`, root `package.json`, `turbo.json`).

---

### Phase 1: Frontend Monorepo Foundation
- **Status**: `FUTURE IMPLEMENTATION`
- **Objective**: Establish a stable, un-overengineered monorepo foundation using JavaScript (`.js` / `.jsx`), Next.js App Router, Tailwind CSS, and Turbo.
- **Scope**:
  - Verify workspace references in root `package.json` (`apps/*`, `packages/*`).
  - Configure `apps/patient-web` (port 3000) and `apps/staff-dashboard` (port 3001) as JS-first Next.js App Router projects.
  - Preserve any existing TS scaffold files without destructive mass-deletion; ensure clean JS resolution.
  - Configure Tailwind CSS using the version already installed in the workspace (do NOT force arbitrary upgrades/downgrades).
  - Scaffold minimal entry points in shared packages: `@doctor/ui`, `@doctor/api-client`, `@doctor/types`, `@doctor/config`, `@doctor/utils`.
- **Dependencies**: Phase 0 completion.
- **Deliverables**:
  - Working `apps/patient-web` landing page (`app/page.js`).
  - Working `apps/staff-dashboard` landing page (`app/page.js`).
  - Minimal package export index files (`index.js`).
- **Backend Dependencies**: None (frontend foundation only).
- **Definition of Done**: `npm run build:frontend` or `turbo run dev` executes without errors. Both web apps render baseline home pages.

---

### Phase 2: Design System Implementation
- **Status**: `FUTURE IMPLEMENTATION`
- **Objective**: Implement reusable, accessible, medical-themed UI components in `@doctor/ui` inspired by Zoom Doctor design language.
- **Scope**:
  - Color system: Medical Emerald (`#0D9488`), Navy Blue (`#0F172A`), Soft Slate (`#F8FAFC`).
  - Primitive UI components (`.jsx`):
    - `Button` (Primary, Secondary, Outline, Ghost, Danger, Loading)
    - `Input` / `Select` / `Textarea` / `Checkbox` (With label, error helper text, left/right icon slots)
    - `Card` (Header, Body, Footer, Hoverable)
    - `Badge` (Status variants: Waiting, Checked-in, Completed, Cancelled, Absent, Emergency)
    - `Avatar` (Patient/Doctor profile pictures with fallback initials)
    - `Modal` / `Dialog` (Overlay, title, close action)
    - `Table` (Header, Rows, Loading state, Empty state)
    - `Tabs` (Tab bar, active indicator)
    - `Spinner` / `Skeleton` (Loading placeholders)
- **Dependencies**: Phase 1 foundation.
- **Deliverables**:
  - `@doctor/ui` export index containing all atomic components.
  - Zero business-logic pages inside `@doctor/ui`.
- **Definition of Done**: Every UI primitive is exported cleanly and can be consumed by both `patient-web` and `staff-dashboard`.

---

### Phase 3: Shared Layouts & Navigation
- **Status**: `FUTURE IMPLEMENTATION`
- **Objective**: Create responsive application shells, navigation bars, footers, and role-specific sidebars.
- **Scope**:
  - `apps/patient-web`:
    - Public Navigation Bar (Logo, Doctor Search, Clinics, Login/Register CTA).
    - Patient App Shell (Sidebar/Header with profile dropdown, active appointments link, notifications icon).
    - Footer (Quick links, emergency hotline notice, clinic partner info).
  - `apps/staff-dashboard`:
    - Staff App Shell with dynamic role layout (`Doctor` vs `Receptionist` vs `Clinic Admin`).
    - Top header (Active clinic selector, status indicator, profile menu).
    - Role-based Sidebar (Doctor items: Dashboard, Queue, Appointments, Schedule; Receptionist items: Token Desk, Patient Registration, Queue Controller, Doctors).
- **Dependencies**: Phase 2 components.
- **Deliverables**:
  - `apps/patient-web/app/layout.js`
  - `apps/staff-dashboard/app/layout.js`
  - Navigation & Sidebar components in `apps/*/app/_components/`.
- **Definition of Done**: Both applications have fully responsive, visually polished layout shells.

---

### Phase 4: Public Patient Experience
- **Status**: `FUTURE IMPLEMENTATION`
- **Objective**: Build the public patient-facing discovery experience inspired by Zoom Doctor.
- **Scope**:
  - Homepage (`apps/patient-web/app/page.js`): Hero banner, quick doctor search widget (specialization, clinic location), featured doctors grid, "How it works" section.
  - Doctor Search / Listing (`/doctors`): Search filters (specialization, availability, fee, gender), doctor cards showing experience, rating, clinic location, next available slot.
  - Doctor Details Profile (`/doctors/[id]`): Bio, qualifications, clinic associations, daily working hours, consultation fee, review highlights, "Book Appointment" CTA.
  - Clinic Listing & Profile (`/clinics`, `/clinics/[id]`): Clinic details, address, latitude/longitude map placeholder, attached doctors.
- **Dependencies**: Phase 3 layouts.
- **Deliverables**:
  - Public search & profile routes in `apps/patient-web`.
- **Backend Dependencies**: `GET /api/v1/doctors`, `GET /api/v1/clinic`.
- **Definition of Done**: Patients can visually navigate doctors, view profiles, and access the appointment booking interface.

---

### Phase 5: Patient Application
- **Status**: `FUTURE IMPLEMENTATION`
- **Objective**: Build authenticated patient features for booking, tracking live queues, and managing medical records.
- **Scope**:
  - Appointment Booking Flow (`/book/[doctorId]`): Date picker, time/queue mode selection (Live Queue vs Time Slot), patient details (self vs family member), booking summary, confirmation modal.
  - Patient Dashboard (`/dashboard`): Upcoming appointments card, live queue status widget ("Your Token: #14 | Current Token: #10"), recent prescriptions summary.
  - Appointment History (`/appointments`): List of past/cancelled/completed visits, view details, download report CTA.
  - Medical Records & Reviews (`/records`, `/reviews`): Past consultation summaries, submit doctor review modal.
- **Dependencies**: Phase 4 public views.
- **Backend Dependencies**: `POST /api/v1/appointments`, `GET /api/v1/patient/my-appointments`, `POST /api/v1/reviews`.
- **Definition of Done**: Patient can complete booking workflow, view active tokens, and manage personal appointment history.

---

### Phase 6: Doctor Application
- **Status**: `FUTURE IMPLEMENTATION`
- **Objective**: Build the Doctor consultation and queue management dashboard inside `apps/staff-dashboard`.
- **Scope**:
  - Doctor Dashboard (`/doctor/dashboard`): Today's appointment counter, current active token card, quick status toggle (OPEN / PAUSED / CLOSED).
  - Live Queue Controller (`/doctor/queue`):
    - Active Token Display (Big bold token number, patient name, age, gender, booking source).
    - Queue Action Buttons: **Call Next Token**, **Mark Completed**, **Mark Absent**, **Pause Queue**.
    - Upcoming Queue List (Draggable/re-orderable list of waiting patients).
  - Schedule & Availability Manager (`/doctor/schedule`): Weekly working hours by clinic, consultation duration setting (`avgConsultationMinutes`), queue mode selector (LIVE, TIME_SLOT, PRIVATE).
  - Patient Records View (`/doctor/patients`): Search patient history, view past prescriptions/reports.
- **Dependencies**: Phase 3 staff layout.
- **Backend Dependencies**: `GET /api/v1/queue/today`, `POST /api/v1/queue/next`, `PUT /api/v1/doctors/schedule`.
- **Definition of Done**: Doctor can manage daily queue, call tokens in real-time, and update consultation status.

---

### Phase 7: Receptionist Application
- **Status**: `FUTURE IMPLEMENTATION`
- **Objective**: Build the Receptionist front-desk token management and walk-in registration dashboard inside `apps/staff-dashboard`.
- **Scope**:
  - Front Desk Dashboard (`/receptionist/dashboard`): Chamber/Doctor selection dropdown, overall clinic queue overview.
  - Walk-In & Patient Registration (`/receptionist/register-patient`): Quick registration form (Name, Phone, Age, Gender, Address), immediate token generation.
  - Token Desk / Queue Management (`/receptionist/queue`): Issue walk-in token for selected doctor, mark patient checked-in, override token sequence for emergency cases (`isEmergency: true`).
  - Doctor Availability Monitor (`/receptionist/doctors`): Live status of chamber doctors (In-Session, On-Break, Absent).
- **Dependencies**: Phase 3 staff layout.
- **Backend Dependencies**: `POST /api/v1/receptionist/walk-in`, `GET /api/v1/receptionist/doctors`.
- **Definition of Done**: Receptionist can register walk-in patients in under 30 seconds and issue live tokens.

---

### Phase 8: Authentication & Role-Based Access
- **Status**: `FUTURE IMPLEMENTATION`
- **Objective**: Implement secure client-side authentication, token management, and role-based route guards.
- **Scope**:
  - Auth Pages in `patient-web`: `/login`, `/register`, `/forgot-password`, `/reset-password`.
  - Auth Pages in `staff-dashboard`: `/login` (Unified staff login for Doctor, Receptionist, Admin).
  - Token Storage Architecture:
    - Access Token: In-memory (React Context / Auth Store).
    - Refresh Token: Automatic HttpOnly cookie via backend (`/api/v1/auth/refresh`).
  - Client Auth Context (`AuthProvider.jsx`): Manages `user`, `role`, `isAuthenticated`, `login()`, `logout()`.
  - Route Protection Middleware / Guards:
    - `patient-web`: Redirect unauthenticated users from `/dashboard/*` to `/login`.
    - `staff-dashboard`: Role check (`DOCTOR` allowed on `/doctor/*`, `RECEPTIONIST` allowed on `/receptionist/*`, `ADMIN` allowed on `/admin/*`).
- **Dependencies**: Phases 5, 6, 7.
- **Backend Dependencies**: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET /api/v1/auth/me`.
- **Definition of Done**: Users are seamlessly directed to their role-specific dashboards upon login and unauthorized route access is blocked.

---

### Phase 9: API & Zod Integration
- **Status**: `FUTURE IMPLEMENTATION`
- **Objective**: Wire all UI forms and data fetching hooks to `@doctor/api-client` and apply client-side Zod validation.
- **Scope**:
  - Instantiate HTTP client (`@doctor/api-client/src/http-client.js`) using native `fetch` or `axios` with interceptors for Authorization header (`Bearer <token>`) and 401 token refresh.
  - Modular API Services: `authService`, `doctorService`, `patientService`, `appointmentService`, `queueService`, `clinicService`, `notificationService`.
  - Zod Form Validation: Attach Zod schemas (`@doctor/types` or local app validations) to patient registration, walk-in form, appointment booking, and doctor schedule settings.
  - Error Handling UI: Display field-level Zod validation errors and toast alerts for API error responses.
- **Dependencies**: Phase 8 authentication.
- **Backend Dependencies**: All Express routes (`/api/v1/*`).
- **Definition of Done**: All application views perform real API requests with clean input validation and error handling.

---

### Phase 10: Realtime + QA + Production Polish
- **Status**: `FUTURE IMPLEMENTATION`
- **Objective**: Connect Socket.io client for live queue/token updates, notifications, and conduct end-to-end QA.
- **Scope**:
  - Realtime Socket Client (`@doctor/api-client/src/socket-client.js`): Socket.io client connecting to `NEXT_PUBLIC_SOCKET_URL`.
  - Room Subscriptions:
    - Join `queue:<doctorId>:<clinicId>` room on live queue screens.
    - Join `appointment:<appointmentId>` room on patient token tracking screen.
    - Join `clinic:<clinicId>` room for announcements.
  - Realtime Event Handlers:
    - Listen for `queueUpdate`: Refresh current token counter.
    - Listen for `tokenCalled`: Trigger audio/visual alert ("Token #12 called for Dr. Smith").
    - Listen for `appointmentCompleted`: Update patient status badge to COMPLETED.
    - Listen for `appointmentNotification` and `announcement`: Display live notification banner.
  - Production QA: Mobile responsiveness test, cross-browser compatibility, light accessibility audit.
- **Dependencies**: Phase 9 API integration.
- **Backend Dependencies**: `src/sockets/` (`queue.socket.js`, `notification.socket.js`, `announcement.socket.js`).
- **Definition of Done**: Live queue updates appear instantaneously across doctor, receptionist, and patient screens without page reloads.

---

## Architectural Risks & Mitigation Strategies

1. **Risk: Breaking Backend Code During Frontend Setup**
   - *Mitigation*: Strictly enforce the protection rule. Files in `src/`, `prisma/`, `docker-compose.yml`, and `Dockerfile` MUST NOT be modified under any circumstances by frontend tasks.
2. **Risk: Token Drift / Session Expiration During Live Queue Usage**
   - *Mitigation*: Implement silent token refreshing in `@doctor/api-client` via background refresh calls prior to access token expiration.
3. **Risk: Socket Reconnection Overhead in High-Traffic Clinics**
   - *Mitigation*: Ensure client socket leaves rooms (`leaveQueue`, `leaveAppointment`) on component unmount to prevent memory leaks and orphan socket subscriptions.
