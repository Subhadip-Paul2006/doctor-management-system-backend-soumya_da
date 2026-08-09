# UI / Page Inventory

> **Platform**: Doctor Management System  
> **Target Audience**: AI Coding Agents (Kimi / Antigravity) & Frontend Engineers  
> **Status Tag Legend**:
> - `CONFIRMED FROM BACKEND`: Explicitly backed by existing Express routes, controllers, or Prisma models.
> - `REFERENCE-INSPIRED`: Derived from Zoom Doctor visual/UX patterns (`zoomdoctor.in`).
> - `TO BE CONFIRMED WITH BACKEND TEAM`: Pending formal backend specification or contract confirmation.

---

## Overview

This inventory categorizes all user-facing views across the two frontend applications:
1. `apps/patient-web`: Public marketing, doctor discovery, patient portal, and appointment booking.
2. `apps/staff-dashboard`: Unified dashboard application shared by Doctors, Receptionists, and future Admins.

---

## 1. PUBLIC VIEWS (`apps/patient-web`)

### 1.1 Homepage
- **Route Suggestion**: `/` (`app/page.js`)
- **Purpose**: Brand landing page, primary entry point for patients to search doctors and clinics.
- **Primary User**: Public visitor / Unauthenticated patient.
- **Major UI Sections**:
  - Hero Section: Headline, quick search bar (Specialization input, Location/City dropdown, "Find Doctor" button).
  - Quick Category Cards: Cardiology, Dermatology, Pediatrics, Orthopedics, General Medicine.
  - Featured Doctors Grid: Doctor photo, name, specialization, experience, clinic name, fee, next slot, "Book Now" CTA.
  - Clinic Network Banner: Partner clinics count, active doctors count.
  - "How It Works" Section: 3-step visual guide (Search -> Select Slot -> Get Token / Consultation).
  - Patient Reviews Carousel: Verified patient feedback cards.
  - Platform Footer: Quick links, clinic partner sign-up link, support contacts, emergency notice.
- **Backend Dependencies**: `GET /api/v1/doctors`, `GET /api/v1/clinic`, `GET /api/v1/reviews`.
- **Realtime Dependencies**: None.
- **Status**: `REFERENCE-INSPIRED` (Layout inspired by Zoom Doctor; data backed by `GET /api/v1/doctors`).

---

### 1.2 Doctor Directory & Search
- **Route Suggestion**: `/doctors` (`app/(public)/doctors/page.js`)
- **Purpose**: Searchable, filterable directory of all verified doctors across registered clinics.
- **Primary User**: Public visitor / Patient.
- **Major UI Sections**:
  - Top Search & Filter Bar: Text search (Doctor name/keyword), Specialization filter, City/Location filter, Availability filter (Today, Tomorrow), Fee range filter.
  - Results Summary Header: Found doctors count, active filter tags, sort dropdown (Relevance, Experience, Fee Low-to-High).
  - Doctor Card List:
    - Left: Profile photo, verification checkmark, rating score.
    - Center: Doctor name, qualifications (e.g. MBBS, MD), specialization, experience years, clinic name & address.
    - Right: Consultation fee, Queue Mode badge (`LIVE` vs `TIME_SLOT`), next available token/slot estimate, "View Profile" & "Book Token" CTAs.
  - Pagination / Load More Controls.
- **Backend Dependencies**: `GET /api/v1/doctors` (supports `specialization`, `clinicId`, `search` query parameters).
- **Realtime Dependencies**: Optional `queueUpdate` event for live queue length preview.
- **Status**: `CONFIRMED FROM BACKEND` (Supported by `Doctor` model & `GET /api/v1/doctors`).

---

### 1.3 Doctor Public Profile
- **Route Suggestion**: `/doctors/[doctorId]` (`app/(public)/doctors/[doctorId]/page.js`)
- **Purpose**: Comprehensive profile details of a doctor, including clinic schedules and booking entry point.
- **Primary User**: Public visitor / Patient.
- **Major UI Sections**:
  - Doctor Header Card: Avatar, full name, credentials, primary specialization, overall star rating, total consultations count.
  - Profile Tabs:
    - **Overview**: Biography, experience summary, medical qualifications, languages spoken.
    - **Clinics & Schedule**: List of associated clinics (`DoctorClinicAssociation`), day-of-week schedule, consultation fee, queue mode (`LIVE` / `TIME_SLOT`).
    - **Reviews**: Patient ratings and verified reviews list.
  - Sticky Booking Action Sidebar / Floating Bottom Bar: Selected clinic selector, queue mode indicator, "Book Appointment / Token" primary button.
- **Backend Dependencies**: `GET /api/v1/doctors/:id`, `GET /api/v1/reviews` (filtered by `doctorId`).
- **Realtime Dependencies**: None.
- **Status**: `CONFIRMED FROM BACKEND` (Supported by `Doctor`, `DoctorClinicAssociation`, `Review` Prisma models).

---

### 1.4 Clinic Directory & Profile
- **Route Suggestion**: `/clinics`, `/clinics/[clinicId]` (`app/(public)/clinics/page.js`, `app/(public)/clinics/[clinicId]/page.js`)
- **Purpose**: Showcase clinic information, location, working hours, and attached doctors.
- **Primary User**: Public visitor / Patient.
- **Major UI Sections**:
  - Clinic Banner & Header: Clinic logo, name, city, state, pincode, contact information.
  - Working Hours Table: Weekly schedule (`ClinicWorkingHours`), open/close times, closed days.
  - Attached Doctors Section: List of doctors practising at this clinic (`DoctorClinicAssociation`).
  - Active Announcements Widget: Clinic-wide notices (`Announcement` model).
- **Backend Dependencies**: `GET /api/v1/clinic/:id`, `GET /api/v1/announcements` (filtered by `clinicId`).
- **Realtime Dependencies**: `announcement` event (`clinic:<clinicId>` room).
- **Status**: `CONFIRMED FROM BACKEND` (Supported by `Clinic`, `ClinicWorkingHours`, `Announcement` Prisma models).

---

### 1.5 Patient Authentication Views
- **Route Suggestion**: `/login`, `/register`, `/forgot-password`, `/reset-password` (`app/(auth)/*`)
- **Purpose**: Account access, patient registration, and password recovery.
- **Primary User**: Patient.
- **Major UI Sections**:
  - Login Card: Email input, password input, "Remember me" checkbox, "Forgot password?" link, "Log In" button, Google OAuth button (`/api/v1/auth/google`).
  - Register Card: Full name, email, password, phone number, date of birth, "Register as Patient" button.
  - Forgot Password Card: Email input, "Send OTP" button (`POST /api/v1/auth/forgot-password`).
  - Reset Password Card: Email, OTP code input (6 digits), new password input, "Reset Password" button (`POST /api/v1/auth/reset-password`).
- **Backend Dependencies**: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`.
- **Realtime Dependencies**: None.
- **Status**: `CONFIRMED FROM BACKEND` (Endpoints exist in `src/modules/auth/auth.routes.js`).

---

## 2. PATIENT PORTAL VIEWS (`apps/patient-web`)

### 2.1 Patient Dashboard
- **Route Suggestion**: `/dashboard` (`app/(patient)/dashboard/page.js`)
- **Purpose**: Patient command center showing active appointments, live token tracker, and recent medical activity.
- **Primary User**: Authenticated Patient (`role: PATIENT`).
- **Major UI Sections**:
  - Patient Welcome Banner: Greeting with patient name, quick stats (Active Appointments count, Completed Visits count).
  - Active Live Token Widget (If patient has a token today):
    - Doctor Name & Clinic Name.
    - Large Token Display: **Your Token: #14**.
    - Live Status Counter: **Current Token Calling: #10**.
    - Estimated Wait Time: `(14 - 10) * avgConsultationMinutes` mins.
    - Direct link to Live Queue Tracker view.
  - Upcoming Appointments List: Compact cards showing upcoming date, doctor, clinic, status badge (`WAITING`, `CHECKED_IN`).
  - Quick Actions Grid: "Search Doctor", "View Medical Records", "Rate Last Visit".
- **Backend Dependencies**: `GET /api/v1/patient/my-appointments`, `GET /api/v1/auth/me`.
- **Realtime Dependencies**: `tokenCalled` event (`queue:<doctorId>:<clinicId>` room), `appointmentNotification` event (`appointment:<id>` room).
- **Status**: `CONFIRMED FROM BACKEND` (Supported by `Appointment`, `Queue` models & socket infrastructure).

---

### 2.2 Appointment Booking Wizard
- **Route Suggestion**: `/book/[doctorId]` (`app/(patient)/book/[doctorId]/page.js`)
- **Purpose**: Interactive appointment booking and token acquisition workflow.
- **Primary User**: Authenticated Patient / Guest Patient.
- **Major UI Sections**:
  - Step 1: Select Clinic (If doctor practices at multiple clinics).
  - Step 2: Select Date (Date picker limited by `PlatformSetting.bookingWindowMinutes`).
  - Step 3: Queue Mode & Slot Details (Shows whether token is `LIVE` queue or `TIME_SLOT`).
  - Step 4: Patient Details (Select self profile or enter family member details).
  - Step 5: Booking Summary Card: Doctor name, clinic address, date, estimated start time, consultation fee, booking source (`ONLINE`).
  - "Confirm & Generate Token" Button.
  - Confirmation Modal: Displays generated token number (e.g. **Token #12**), date, and queue instructions.
- **Backend Dependencies**: `POST /api/v1/appointments` (Payload: `doctorId`, `clinicId`, `date`, `bookingSource: "ONLINE"`).
- **Realtime Dependencies**: Fires initial `queueUpdate` event on completion.
- **Status**: `CONFIRMED FROM BACKEND` (Endpoint `POST /api/v1/appointments` exists in `src/modules/appointment/appointment.routes.js`).

---

### 2.3 Live Queue Tracker
- **Route Suggestion**: `/appointments/[appointmentId]/queue` (`app/(patient)/appointments/[appointmentId]/queue/page.js`)
- **Purpose**: Dedicated real-time queue tracking view for a patient waiting for their consultation.
- **Primary User**: Patient holding an active token.
- **Major UI Sections**:
  - Header: Doctor Name, Specialization, Clinic Name.
  - Realtime Queue Display:
    - **Current Token Called**: Huge animated number (e.g. `#11`).
    - **Your Token Number**: Highlighted token badge (e.g. `#15`).
    - **Tokens Remaining Ahead Of You**: `15 - 11 = 4 patients ahead`.
  - Live Status Indicator: Pulse badge (`Live Queue Open`, `Queue Paused`, `Doctor In Consultation`).
  - Audio Alert Toggle: Switch to enable audio chime when token is called.
  - Emergency / Delay Announcement Banner: Shows active `Announcement` if doctor is delayed or on break.
- **Backend Dependencies**: `GET /api/v1/appointments/:id`, `GET /api/v1/queue/status`.
- **Realtime Dependencies**: `queueUpdate`, `tokenCalled`, `appointmentCompleted` (`queue:<doctorId>:<clinicId>` room), `appointmentNotification` (`appointment:<id>` room).
- **Status**: `CONFIRMED FROM BACKEND` (Supported by `queue.socket.js` and `notification.socket.js`).

---

### 2.4 Patient Appointment History & Reviews
- **Route Suggestion**: `/appointments`, `/appointments/[appointmentId]/review` (`app/(patient)/appointments/page.js`)
- **Purpose**: View past appointments, filter by status (`COMPLETED`, `CANCELLED`), and submit doctor reviews.
- **Primary User**: Patient.
- **Major UI Sections**:
  - Status Filter Tabs: All, Upcoming, Completed, Cancelled.
  - Appointment History Table / Cards: Date, Doctor, Clinic, Token Number, Booking Source, Status Badge, Action buttons ("View Summary", "Rate & Review").
  - Review Modal: 5-star rating control, text comment textarea, "Submit Review" button (`POST /api/v1/reviews`).
- **Backend Dependencies**: `GET /api/v1/patient/my-appointments`, `POST /api/v1/reviews`.
- **Realtime Dependencies**: None.
- **Status**: `CONFIRMED FROM BACKEND` (Supported by `Review` model and `review.routes.js`).

---

## 3. DOCTOR DASHBOARD VIEWS (`apps/staff-dashboard`)

### 3.1 Doctor Overview Dashboard
- **Route Suggestion**: `/doctor/dashboard` (`app/(doctor)/dashboard/page.js`)
- **Purpose**: Daily clinical overview for the attending doctor.
- **Primary User**: Authenticated Doctor (`role: DOCTOR`).
- **Major UI Sections**:
  - Today's Summary Metrics:
    - Total Tokens Issued Today (`lastTokenIssued`).
    - Currently Serving Token (`currentToken`).
    - Patients Waiting (`lastTokenIssued - currentToken`).
    - Consultations Completed Count.
  - Current Active Queue Status Bar: Status selector dropdown (`OPEN` [Green], `PAUSED` [Amber], `CLOSED` [Red]).
  - Active Consultation Card: Patient Name, Age, Gender, Token #, Booking Source (`ONLINE` vs `WALK_IN`), Emergency badge (`isEmergency`).
  - Next Patients Queue Preview: Next 5 waiting patients list.
- **Backend Dependencies**: `GET /api/v1/dashboard/doctor`, `GET /api/v1/queue/today`.
- **Realtime Dependencies**: `queueUpdate` (`queue:<doctorId>:<clinicId>` room).
- **Status**: `CONFIRMED FROM BACKEND` (Supported by `dashboard.routes.js` and `queue.routes.js`).

---

### 3.2 Doctor Live Queue Controller
- **Route Suggestion**: `/doctor/queue` (`app/(doctor)/queue/page.js`)
- **Purpose**: Primary operational screen used by the doctor inside the consultation room to call patients and advance tokens.
- **Primary User**: Doctor.
- **Major UI Sections**:
  - Live Token Control Console:
    - **BIG CURRENT TOKEN DISPLAY**: Prominent token number (e.g. `TOKEN #12`).
    - Primary Action Buttons:
      - `[ CALL NEXT TOKEN ]` (Large green primary CTA -> advances `currentToken` and emits `tokenCalled`).
      - `[ MARK COMPLETED ]` (Blue CTA -> marks appointment `COMPLETED` and emits `appointmentCompleted`).
      - `[ MARK ABSENT ]` (Red/Ghost CTA -> marks appointment `ABSENT`).
      - `[ PAUSE QUEUE ]` (Amber CTA -> updates queue status to `PAUSED`).
  - Patient Consultation Details Panel: Patient Name, Age, Gender, Phone, Address, Medical Notes placeholder.
  - Live Patient Queue List: Table of all tokens issued today with status badges (`WAITING`, `CHECKED_IN`, `COMPLETED`, `ABSENT`). Includes "Call Specific Token" manual override option.
- **Backend Dependencies**: `POST /api/v1/queue/next`, `PUT /api/v1/appointments/:id/status`, `GET /api/v1/queue/today`.
- **Realtime Dependencies**: Emits `tokenCalled`, `appointmentCompleted`, `queueUpdate`.
- **Status**: `CONFIRMED FROM BACKEND` (Supported by `queue.routes.js` and `queue.socket.js`).

---

### 3.3 Doctor Schedule & Availability Manager
- **Route Suggestion**: `/doctor/schedule` (`app/(doctor)/schedule/page.js`)
- **Purpose**: Configure weekly clinic associations, daily working hours, consultation timing, and queue mode.
- **Primary User**: Doctor.
- **Major UI Sections**:
  - Clinic Selector: Dropdown to select active clinic (`DoctorClinicAssociation`).
  - Queue Mode Selector: Radio group (`LIVE Queue` vs `TIME_SLOT` vs `PRIVATE`).
  - Consultation Duration Input: Number input (`avgConsultationMinutes`, e.g. 15 mins).
  - Weekly Availability Table: Day of week (`MONDAY` to `SUNDAY`), Start Time (`HH:mm`), End Time (`HH:mm`), Status (`ACTIVE` / `INACTIVE`).
  - "Save Schedule Settings" Button.
- **Backend Dependencies**: `GET /api/v1/doctors/schedule`, `PUT /api/v1/doctors/schedule`.
- **Realtime Dependencies**: None.
- **Status**: `CONFIRMED FROM BACKEND` (Supported by `DoctorClinicAssociation`, `Doctor` model fields).

---

## 4. RECEPTIONIST DASHBOARD VIEWS (`apps/staff-dashboard`)

### 4.1 Front Desk Overview
- **Route Suggestion**: `/receptionist/dashboard` (`app/(receptionist)/dashboard/page.js`)
- **Purpose**: Front desk reception overview for managing patient check-ins and walk-ins.
- **Primary User**: Authenticated Receptionist (`role: RECEPTIONIST`).
- **Major UI Sections**:
  - Clinic & Doctor Filter: Select clinic and assigned doctor (`ReceptionistDoctor`).
  - Front Desk Summary Cards: Walk-Ins Registered Today, Patients Checked-In, Tokens Issued, Queue Status.
  - Quick Token Generator Panel: Quick patient phone search or new walk-in button.
  - Today's Master Appointments Table: List of all appointments for the clinic today across all doctors.
- **Backend Dependencies**: `GET /api/v1/receptionist/dashboard`, `GET /api/v1/receptionist/doctors`.
- **Realtime Dependencies**: `queueUpdate` (`queue:<doctorId>:<clinicId>` room).
- **Status**: `CONFIRMED FROM BACKEND` (Supported by `receptionist.routes.js` and `ReceptionistDoctor` model).

---

### 4.2 Walk-In Patient Registration & Token Desk
- **Route Suggestion**: `/receptionist/walk-in` (`app/(receptionist)/walk-in/page.js`)
- **Purpose**: Register walk-in / phone patients directly at reception and issue physical token slips.
- **Primary User**: Receptionist.
- **Major UI Sections**:
  - Patient Identification Form:
    - Phone number search (Auto-fills patient details if existing patient).
    - Patient Name, Phone, Age, Gender, Address inputs.
  - Token Assignment Form:
    - Select Doctor dropdown (Filtered by active doctors present today).
    - Emergency Checkbox (`isEmergency: true` -> places patient at top of queue).
    - Booking Source selector (`WALK_IN` or `PHONE` or `RECEPTION`).
  - "Register & Print Token Slip" Primary Button.
  - Token Slip Preview / Print Modal: Printable token card containing Token #, Doctor Name, Clinic Name, Date, Timestamp.
- **Backend Dependencies**: `POST /api/v1/receptionist/walk-in` or `POST /api/v1/appointments` (`bookingSource: WALK_IN`).
- **Realtime Dependencies**: Emits `queueUpdate` event.
- **Status**: `CONFIRMED FROM BACKEND` (Supported by `Patient` model walk-in fields `name`/`phone`, `BookingSource.WALK_IN`).

---

### 4.3 Chamber Queue Monitor & Check-In Desk
- **Route Suggestion**: `/receptionist/queue` (`app/(receptionist)/queue/page.js`)
- **Purpose**: Receptionist view for marking physical patient arrival (`CHECKED_IN`) and managing doctor chamber queues.
- **Primary User**: Receptionist.
- **Major UI Sections**:
  - Doctor Selection Tabs: Tab for each doctor working in the clinic today.
  - Live Queue Status Card: Current token calling, queue mode, queue status (`OPEN`, `PAUSED`, `CLOSED`).
  - Patient Check-In List: List of tokens issued. Action button to mark patient `CHECKED_IN` when they arrive in waiting area.
  - Emergency Override Controls: Re-order tokens or insert emergency patient ahead of current queue.
- **Backend Dependencies**: `GET /api/v1/queue/today`, `PUT /api/v1/appointments/:id/status`.
- **Realtime Dependencies**: `tokenCalled`, `queueUpdate` (`queue:<doctorId>:<clinicId>` room).
- **Status**: `CONFIRMED FROM BACKEND` (Supported by `AppointmentStatus.CHECKED_IN` and `queue.routes.js`).

---

## 5. ADMIN / FUTURE VIEWS (`apps/staff-dashboard`)

### 5.1 Clinic Administration & Approvals (Super Admin / Admin)
- **Route Suggestion**: `/admin/clinics` (`app/(admin)/clinics/page.js`)
- **Purpose**: Admin portal to verify new clinics, manage doctor credentials, and issue platform announcements.
- **Primary User**: Admin / Super Admin (`role: ADMIN`, `role: SUPER_ADMIN`).
- **Major UI Sections**:
  - Pending Clinic Approvals Table: Clinic Name, Address, Owner Email, Approval action (`isApproved: true`).
  - Verified Doctors List: Doctor details, verification badge toggle (`isVerified: true`).
  - Platform Announcements Creator: Title, message, announcement type (`DOCTOR_ABSENT`, `EMERGENCY`, `GENERAL`), target clinic selector, "Publish Global Announcement" button.
- **Backend Dependencies**: `GET /api/v1/admin/clinics`, `PUT /api/v1/admin/clinics/:id/approve`, `POST /api/v1/announcements`.
- **Realtime Dependencies**: Emits `announcement` event (global or `clinic:<id>`).
- **Status**: `CONFIRMED FROM BACKEND` (Supported by `admin.routes.js`, `announcement.routes.js`, `Role.SUPER_ADMIN`).

---

## Summary Matrix of Screen Counts

| Category | Application | Confirmed Screens | Reference-Inspired Screens | Total Screens |
| :--- | :--- | :---: | :---: | :---: |
| **Public** | `apps/patient-web` | 4 | 1 | **5** |
| **Patient Portal** | `apps/patient-web` | 4 | 0 | **4** |
| **Doctor Dashboard** | `apps/staff-dashboard` | 3 | 0 | **3** |
| **Receptionist Dashboard** | `apps/staff-dashboard` | 3 | 0 | **3** |
| **Admin Portal** | `apps/staff-dashboard` | 1 | 0 | **1** |
| **TOTAL** | | **15** | **1** | **16** |
