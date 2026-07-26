# 🏥 Doctor Management System - Backend

A secure REST API backend for a Doctor Management System built with Node.js, Express.js, and MongoDB. It provides authentication, doctor management, appointment booking, and role-based access for Admins, Doctors, and Patients.

---

## ✨ Features

- JWT Authentication
- Role-Based Authorization
- Admin Dashboard APIs
- Doctor Management
- Patient Management
- Appointment Booking
- Appointment Approval/Rejection
- Secure Password Hashing (bcrypt)
- MongoDB Database
- RESTful API
- Error Handling
- Input Validation

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- dotenv
- CORS
- Cookie Parser

---

## 📂 Project Structure

backend/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── uploads/
├── server.js
└── package.json

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/soumya28022005/doctor-management-system-backend.git
```

```bash
cd doctor-management-system-backend
```

### Install Packages

```bash
npm install
```

### Create .env

```env
PORT=5000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret

JWT_EXPIRE=7d

CLIENT_URL=http://localhost:5173
```

---

## ▶ Run Project

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

## 🔐 Authentication

JWT Authentication

Protected Routes

Role Based Access

- Admin
- Doctor
- Patient

---

## 📌 API Endpoints

### Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

---

### Doctor

GET /api/doctors

GET /api/doctors/:id

POST /api/doctors

PUT /api/doctors/:id

DELETE /api/doctors/:id

---

### Appointment

POST /api/appointments

GET /api/appointments

PUT /api/appointments/:id

DELETE /api/appointments/:id

---

### Admin

GET /api/admin/dashboard

GET /api/admin/users

GET /api/admin/doctors

GET /api/admin/appointments

---

## 📸 API Testing

Use

- Postman
- Thunder Client
- Insomnia

---

## 🌐 Environment Variables

| Variable | Description |
|-----------|-------------|
| PORT | Server Port |
| MONGO_URI | MongoDB URI |
| JWT_SECRET | JWT Secret |
| JWT_EXPIRE | Token Expiry |
| CLIENT_URL | Frontend URL |

---

## 🧪 Future Improvements

- Email Notifications
- Video Consultation
- Prescription Module
- Payment Gateway
- Medical Reports Upload
- Docker Support
- Swagger Documentation

---

## 👨‍💻 Author

Soumya Chatterjee

GitHub:
https://github.com/soumya28022005

LinkedIn:
(Add your LinkedIn)

---

## 📄 License

MIT License