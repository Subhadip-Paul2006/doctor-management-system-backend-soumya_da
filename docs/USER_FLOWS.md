# User Flows & Realtime Event Journeys

> **Platform**: Doctor Management System  
> **Target Audience**: AI Coding Agents (Kimi / Antigravity) & Frontend Engineers  
> **Status Legend**:
> - `CONFIRMED FROM BACKEND`: Explicitly backed by existing Express routes, controllers, or Prisma models.
> - `REFERENCE-INSPIRED`: Derived from Zoom Doctor visual/UX patterns (`zoomdoctor.in`).
> - `TO BE CONFIRMED WITH BACKEND TEAM`: Pending formal backend specification or contract confirmation.

---

## Overview

This document maps step-by-step user journeys for Patients, Receptionists, and Doctors, detailing HTTP API calls, WebSocket events, room subscriptions, state transitions, and UI outcomes.

---

## Flow 1: Patient Doctor Discovery & Token Acquisition

**Primary User**: Patient (Self-registered or Guest)  
**Goal**: Search for a doctor by specialization, view clinic schedule, and acquire an online appointment token.

```
+------------------+     +-------------------+     +--------------------+     +---------------------+
| 1. Search Doctor | --> | 2. Select Clinic  | --> | 3. Confirm Date &  | --> | 4. Token Generated  |
|    & Speciality  |     |    & View Profile |     |    Booking Details |     |    & Live Tracking  |
+------------------+     +-------------------+     +--------------------+     +---------------------+
```

### Detailed Sequence Steps:
1. **Search & Discovery**:
   - Patient visits `apps/patient-web` homepage (`/`) or directory (`/doctors`).
   - Patient selects specialization (e.g. `Cardiology`) and city (e.g. `Kolkata`).
   - Frontend issues API request: `GET /api/v1/doctors?specialization=Cardiology`.
   - Frontend renders list of matching doctors with fee, experience, and current queue mode (`LIVE` vs `TIME_SLOT`).

2. **Profile Inspection**:
   - Patient clicks on doctor card to open `/doctors/[doctorId]`.
   - Frontend issues API request: `GET /api/v1/doctors/:id`.
   - Frontend loads associated clinics (`DoctorClinicAssociation`), weekly schedule (`ClinicWorkingHours`), and patient reviews (`GET /api/v1/reviews?doctorId=:id`).

3. **Appointment Booking**:
   - Patient clicks **"Book Appointment"** CTA.
   - Frontend navigates to `/book/[doctorId]`.
   - Patient selects target clinic and appointment date.
   - Patient enters/verifies patient details (Name, Phone, Age, Gender).
   - Patient submits booking form.
   - Frontend issues API request:
     ```json
     POST /api/v1/appointments
     {
       "doctorId": "doc-uuid-123",
       "clinicId": "clinic-uuid-456",
       "date": "2026-08-10",
       "bookingSource": "ONLINE",
       "patientDetails": { "name": "Anil Kumar", "phone": "9876543210" }
     }
     ```
   - Backend creates `Appointment` record with auto-incremented `token` number for the day's `Queue`.

4. **Token Slip & Realtime Room Entry**:
   - Backend returns HTTP `201 Created` with payload containing `{ appointmentId, token: 14, date, queueId }`.
   - Frontend displays **Token Confirmation Card**: `TOKEN #14`.
   - Frontend connects Socket.io client to `NEXT_PUBLIC_SOCKET_URL` and emits:
     - `socket.emit("joinAppointment", appointmentId)` -> joins `appointment:<appointmentId>` room.
     - `socket.emit("joinQueue", { doctorId, clinicId })` -> joins `queue:<doctorId>:<clinicId>` room.
   - Patient can now view live token progress on `/appointments/[appointmentId]/queue`.

---

## Flow 2: Receptionist Front Desk & Walk-In Token Management

**Primary User**: Receptionist (`role: RECEPTIONIST`)  
**Goal**: Register walk-in patients arriving physically at the clinic, issue sequential token slips, mark arrivals, and handle emergency overrides.

```
+---------------------+     +--------------------+     +---------------------+     +----------------------+
| 1. Walk-In Patient  | --> | 2. Enter Phone/    | --> | 3. Select Doctor &  | --> | 4. Token Printed &   |
|    Arrives at Desk  |     |    Patient Details |     |    Emergency Flag   |     |    Added to Queue    |
+---------------------+     +--------------------+     +---------------------+     +----------------------+
```

### Detailed Sequence Steps:
1. **Front Desk Access**:
   - Receptionist logs into `apps/staff-dashboard` (`/login`).
   - Frontend redirects Receptionist to `/receptionist/dashboard`.
   - Frontend issues API request: `GET /api/v1/receptionist/doctors` to fetch doctors present today in the clinic.

2. **Walk-In Registration**:
   - Receptionist navigates to `/receptionist/walk-in`.
   - Receptionist inputs patient's phone number into quick lookup field.
   - If existing patient: API returns patient details.
   - If new walk-in patient: Receptionist fills name, phone, age, gender, address.

3. **Token Allocation & Emergency Handling**:
   - Receptionist selects target doctor from active list.
   - If emergency case: Receptionist checks `isEmergency: true`.
   - Receptionist clicks **"Register & Issue Token"**.
   - Frontend issues API request:
     ```json
     POST /api/v1/receptionist/walk-in
     {
       "doctorId": "doc-uuid-123",
       "clinicId": "clinic-uuid-456",
       "date": "2026-08-10",
       "bookingSource": "WALK_IN",
       "isEmergency": false,
       "name": "Suresh Roy",
       "phone": "9830098300"
     }
     ```
   - Backend updates `Queue.lastTokenIssued` and creates `Appointment` record.
   - Backend emits Socket.io event `queueUpdate` to room `queue:<doctorId>:<clinicId>`.

4. **Arrival & Check-In Marking**:
   - When patient takes a seat in the waiting area, Receptionist clicks `[ MARK CHECKED-IN ]` on `/receptionist/queue`.
   - Frontend issues API request: `PUT /api/v1/appointments/:id/status` `{ "status": "CHECKED_IN" }`.
   - Status updates in real-time across both doctor and patient displays.

---

## Flow 3: Doctor Consultation & Live Queue Control

**Primary User**: Doctor (`role: DOCTOR`)  
**Goal**: Manage consultation session, call next patient token, mark consultation completed, and handle breaks/pauses.

```
+--------------------+     +-------------------+     +---------------------+     +----------------------+
| 1. Doctor Opens    | --> | 2. Click "Call    | --> | 3. Conduct Patient  | --> | 4. Mark "Completed"  |
|    Queue Console   |     |    Next Token"    |     |    Consultation     |     |    & Call Next       |
+--------------------+     +-------------------+     +---------------------+     +----------------------+
```

### Detailed Sequence Steps:
1. **Consultation Console Initialization**:
   - Doctor logs into `apps/staff-dashboard` (`/login`).
   - Frontend redirects Doctor to `/doctor/dashboard` or `/doctor/queue`.
   - Frontend issues API request: `GET /api/v1/queue/today` to fetch today's `Queue` object (`currentToken`, `lastTokenIssued`, `status`).
   - Frontend socket client joins room `queue:<doctorId>:<clinicId>`.

2. **Advancing Current Token**:
   - Doctor clicks **"CALL NEXT TOKEN"** button on console.
   - Frontend issues API request: `POST /api/v1/queue/next` `{ "doctorId": "...", "clinicId": "..." }`.
   - Backend increments `Queue.currentToken` (e.g. from `11` to `12`).
   - Backend triggers socket method `emitTokenCalled(doctorId, clinicId, { currentToken: 12, appointmentId: "..." })`.
   - Server broadcasts Socket event `tokenCalled` to room `queue:<doctorId>:<clinicId>`.
   - Result:
     - Doctor console updates active token to `#12`.
     - Receptionist screen updates active token to `#12`.
     - Patient holding Token #12 receives visual/audio chime: *"Token #12 is now called"*.

3. **Completing Consultation**:
   - After examining patient, Doctor clicks **"MARK COMPLETED"**.
   - Frontend issues API request: `PUT /api/v1/appointments/:id/status` `{ "status": "COMPLETED" }`.
   - Backend updates `Appointment.status = "COMPLETED"`.
   - Backend triggers socket method `emitAppointmentCompleted(doctorId, clinicId, { appointmentId: "..." })`.
   - Server broadcasts `appointmentCompleted` to room `queue:<doctorId>:<clinicId>`.

4. **Pausing Queue for Break**:
   - Doctor clicks **"PAUSE QUEUE"**.
   - Frontend issues API request: `PUT /api/v1/queue/status` `{ "status": "PAUSED" }`.
   - Server emits `queueUpdate` with `status: "PAUSED"`.
   - All patient screens display banner: *"Queue is temporarily paused by doctor"*.

---

## Flow 4: Realtime Socket Capability Maps

### 4.1 Queue & Token Realtime Event Journey

```
                        BACKEND QUEUE SOCKET SYSTEM
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
    queueUpdate                 tokenCalled             appointmentCompleted
         │                           │                           │
  Broadcasts new              Fired when staff            Fired when patient
  token count or              calls next patient          consultation ends
  queue status                token number                
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
                 Target Room: `queue:<doctorId>:<clinicId>`
                                     │
            ┌────────────────────────┼────────────────────────┐
            │                        │                        │
      Patient App             Doctor Console          Reception Desk
    (Live Tracker)           (Queue Control)          (Token Monitor)
```

| Event Name | Trigger Source | Room | Payload Structure | Frontend Action |
| :--- | :--- | :--- | :--- | :--- |
| `joinQueue` | Client -> Server | N/A | `{ doctorId, clinicId }` | Client joins `queue:<doctorId>:<clinicId>` room on queue screen mount. |
| `leaveQueue` | Client -> Server | N/A | `{ doctorId, clinicId }` | Client leaves room on queue screen unmount. |
| `queueUpdate` | Server -> Room | `queue:<doctorId>:<clinicId>` | `{ doctorId, clinicId, currentToken, lastTokenIssued, status }` | Updates live counter displays and status pill (OPEN/PAUSED/CLOSED). |
| `tokenCalled` | Server -> Room | `queue:<doctorId>:<clinicId>` | `{ doctorId, clinicId, currentToken, appointmentId, patientName }` | Triggers token display update and audio chime alert on patient view. |
| `appointmentCompleted` | Server -> Room | `queue:<doctorId>:<clinicId>` | `{ doctorId, clinicId, appointmentId }` | Updates patient list badge to COMPLETED and advances doctor view. |

---

### 4.2 Patient Notification Realtime Event Journey

```
                    BACKEND NOTIFICATION SOCKET SYSTEM
                                     │
                         emitAppointmentNotification
                                     │
                     Target Room: `appointment:<id>`
                                     │
                         Patient App (My Appointments)
                                     │
                         Live Toast & Status Badge
```

| Event Name | Trigger Source | Room | Payload Structure | Frontend Action |
| :--- | :--- | :--- | :--- | :--- |
| `joinAppointment` | Client -> Server | N/A | `appointmentId` | Patient socket joins `appointment:<appointmentId>` room. |
| `leaveAppointment` | Client -> Server | N/A | `appointmentId` | Patient socket leaves `appointment:<appointmentId>` room. |
| `appointmentNotification` | Server -> Room | `appointment:<appointmentId>` | `{ appointmentId, title, message, type, timestamp }` | Displays push toast alert / notification badge on patient screen. |

---

### 4.3 Clinic & Platform Announcement Event Journey

```
                    BACKEND ANNOUNCEMENT SOCKET SYSTEM
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
       emitGlobalAnnouncement                  emitClinicAnnouncement
                 │                                       │
        Broadcast to all                        Target Room: `clinic:<id>`
        connected sockets                                │
                 │                               Patient & Staff Views
                 └───────────────────┬───────────────────┘
                                     │
                           Top Announcement Banner
```

| Event Name | Trigger Source | Room / Target | Payload Structure | Frontend Action |
| :--- | :--- | :--- | :--- | :--- |
| `announcement` | Server -> Global | All connected clients | `{ id, type, title, message, createdAt }` | Renders global platform maintenance/emergency header banner. |
| `announcement` | Server -> Room | `clinic:<clinicId>` | `{ id, type, title, message, clinicId, doctorId }` | Renders clinic-specific notice (e.g. "Dr. Smith delayed by 30 mins"). |

---

## State Transition Diagrams

### Appointment Status Lifecycle
```
       [ Booking Created ]
                │
                ▼
            WAITING ────────────► CANCELLED (Patient/Staff)
                │
                ▼
            CHECKED_IN (Receptionist marks arrival)
                │
                ▼
            COMPLETED (Doctor finishes consultation)
                │
                ▼
             ABSENT (Doctor/Staff marks no-show)
```

### Queue Status Lifecycle
```
             [ Morning Setup ]
                    │
                    ▼
                  OPEN
               ┌────┴────┐
               │         │
               ▼         ▼
            PAUSED ────► CLOSED (End of day)
```
