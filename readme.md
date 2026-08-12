# Doctor & Clinic Management System (Monorepo)

This repository is organized as an **`apps/` + `packages/` monorepo layout**, housing the complete multi-tenant Doctor & Clinic Management System, including the Express/Prisma backend, patient web portal, staff dashboard, and shared TypeScript libraries.

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

3. **Frontend Applications (Turbo)**:
   ```bash
   npm run dev:frontend
   ```

4. **Prisma Database Commands**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```