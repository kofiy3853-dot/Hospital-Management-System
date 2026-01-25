# 🏥 Hospital Management System (HMS) Pro

An enterprise-level Hospital Management System built with the MERN stack (MongoDB, Express, React, Node.js).

## 🚀 Quick Start

### 1. Prerequistes
- Node.js (v18+)
- MongoDB Atlas Account (or local MongoDB)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env # Add your MongoDB URI and JWT Secrets
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🏗️ System Architecture
- **Backend**: Node.js, Express.js (REST API)
- **Frontend**: React 18, Vite, Vanilla CSS
- **Database**: MongoDB (Mongoose)
- **Security**: JWT + Refresh Tokens, RBAC Middleware, Helmet, Rate Limting

## 🏥 Modules
- **Authentication**: Role-based access (Admin, Doctor, Nurse, etc.)
- **Patient Management**: Registration and medical history tracking.
- **Appointments**: Real-time scheduling and status updates.
- **EMR**: Digital clinical records and vitals tracking.
- **Pharmacy**: Prescription management and inventory deduction.

## 🛠️ Testing
```bash
cd backend
npm test
```

## 📄 License
MIT
