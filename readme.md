MedConnect Backend (Doctor Management System)

A robust, enterprise-grade backend built for a modern multi-clinic Doctor Management and Real-Time Appointment Queue System. This backend supports secure role-based access, automated queue management, multi-clinic doctor associations, live announcements, and integrated digital prescription generation.

🚀 Tech Stack

Runtime: Node.js

Framework: Express.js

Database & ORM: PostgreSQL with Prisma ORM

Caching & Real-time: Redis & Socket.io

Authentication: JWT (JSON Web Tokens) & Passport.js

File Uploads: Cloudinary

PDF Generation: PDFKit

📂 Project Architecture

The project follows a clean, modular architecture separating controllers, services, repositories, routes, and validations for maximum maintainability:

src/
├── config/         # Database, Redis, Socket, Passport, and Cloudinary setups
├── middlewares/    # Authentication, role-control, rate-limiting, and error handling
├── modules/        # Feature-based business logic domains
│   ├── admin/
│   ├── announcement/
│   ├── appointment/
│   ├── auth/
│   ├── clinic/
│   ├── dashboard/    # Analytics and overview statistics
│   ├── doctor/
│   ├── notification/
│   ├── patient/
│   ├── pharmacy/
│   ├── prescription/
│   ├── queue/
│   ├── receptionist/
│   └── user/
├── sockets/        # Real-time WebSocket handlers (Queue, Announcements)
├── utils/          # Helpers (API Error, API Response, PDF Generator, Cloudinary)
├── app.js          # Express app configuration
└── server.js       # Application entry point


🔑 Core Features

Multi-Role Authentication & Authorization: Supports Admins, Doctors, Receptionists, Patients (including Guest capabilities), and Pharmacy staff with strict permission controls.

Real-Time Queue Management: Live tracking of appointment queues powered by Socket.io and Redis cache layers.

Clinic-Scoped Operations: Operations like queue management and appointment booking are now securely scoped to specific clinics.

Multi-Clinic Associations: Doctors can manage schedules and availability across multiple clinics.

Dashboard & Analytics: Dedicated module for platform overviews and statistics.

Digital Prescriptions: Built-in PDF generator to instantly create and share medical prescriptions.

Live Announcements System: Broadcast updates and announcements to specific clinics or user groups in real time.

File Upload Integration: Secure media and document management using Cloudinary.

⚙️ Getting Started

Prerequisites

Node.js (v18+ recommended)

PostgreSQL database instance

Redis server (optional/recommended for queue caching)

Installation

Clone the repository

git clone https://github.com/soumya28022005/doctor-management-system-backend.git
cd doctor-management-system-backend


Install dependencies

npm install


Configure Environment Variables
Create a .env file in the root directory and add your configurations (Database URL, JWT Secret, Cloudinary keys, Redis URL, etc.).

Run Database Migrations & Seeding

npx prisma migrate dev
npm run seed


Start the Development Server

npm run dev


🛠️ API Modules & Endpoints

Module

Base Route

Description

Auth

/api/v1/auth

User registration, login, token refresh, and logout

Admin

/api/v1/admin

Platform settings, overview stats, and system administration

Dashboard

/api/v1/dashboard

Analytics and system overview statistics

Doctor

/api/v1/doctors

Doctor profiles, schedules, and multi-clinic mapping

Patient

/api/v1/patients

Patient profile management and medical history

Appointment

/api/v1/appointments

Booking, rescheduling, and status management

Queue

/api/v1/queue

Live queue controls, logs, and token tracking

Clinic

/api/v1/clinics

Clinic registration and association controls

Prescription

/api/v1/prescriptions

Digital prescription generation and retrieval

Pharmacy

/api/v1/pharmacy

Prescription fulfillment and medicine dispensing

Announcements

/api/v1/announcements

Real-time broadcast creation and management

📄 License

This project is licensed under the MIT License.