# 🦷 Dental Clinic API

A scalable backend system for managing a dental clinic, built with **Node.js**, **Express.js**, and **MongoDB** using a clean layered architecture.

---

## 🚀 Features

- 🔐 Authentication System (Register / Login / Logout / Refresh Token Rotation)
- 👥 User Management (Admin / Doctor / Receptionist / Patient)
- 📅 Appointment Booking System
- 🛡️ Role-Based Access Control (RBAC)
- ✅ Request Validation using Zod
- ⚡ Centralized Error Handling
- 🔄 Async Wrapper for cleaner async code
- 🔑 JWT Authentication (Access + Refresh Tokens in Cookies)
- 📄 Pagination & Filtering (Users)

---

## 📁 Project Structure

```
dental-clinic-api
├── app.js
├── server.js
├── config/
├── controllers/
│   ├── auth.controller.js
│   ├── users.controller.js
│   └── appointment.controller.js
├── middlewares/
├── models/
│   ├── user.model.js
│   ├── doctor.model.js
│   ├── patient.model.js
│   └── appointment.model.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   └── appointment.routes.js
├── services/
├── utils/
├── validators/
└── README.MD
```

---

## 🧠 Architecture

The project follows **Layered Architecture**:

- **Routes** → API endpoints
- **Controllers** → Handle request/response
- **Services** → Business logic
- **Models** → Database layer
- **Middlewares** → Auth / Validation / Authorization
- **Utils** → Shared helpers

---

## 🔐 Authentication System

### Endpoints

| Endpoint                 | Method | Description        |
| ------------------------ | ------ | ------------------ |
| `/api/auth/register`     | POST   | Register user      |
| `/api/auth/login`        | POST   | Login & get tokens |
| `/api/auth/logout`       | POST   | Logout             |
| `/api/auth/refreshToken` | POST   | Refresh tokens     |

---

### 🔄 Token Flow

- **Access Token**

  - Short-lived (15 min)
  - Used in Authorization header

- **Refresh Token**

  - Stored in **HttpOnly Cookie**
  - Used to generate new access tokens

- **Security Implementation**

  - Refresh Token is **hashed in DB**
  - Token Rotation on every refresh
  - Cookie config:

    - `httpOnly`
    - `secure` (production)
    - `sameSite: strict`

---

## 👥 User Management

### ➕ Create Users

| Endpoint                       | Access                    |
| ------------------------------ | ------------------------- |
| `POST /api/users/admin`        | super_admin               |
| `POST /api/users/doctor`       | super_admin, admin        |
| `POST /api/users/receptionist` | super_admin, admin        |
| `POST /api/users/patient`      | super_admin, receptionist |

---

### 📥 Get Users

| Endpoint                     | Access                    |
| ---------------------------- | ------------------------- |
| `GET /api/users/users`       | super_admin, admin        |
| `GET /api/users/doctors`     | super_admin, admin        |
| `GET /api/users/patients`    | super_admin, receptionist |
| `GET /api/users/patient/:id` | super_admin, receptionist |

---

### ✏️ Update & Status

| Endpoint                          | Description                |
| --------------------------------- | -------------------------- |
| `PATCH /api/users/:id/status`     | Activate / Deactivate user |
| `PATCH /api/users/:id/modifyuser` | Update user                |
| `PATCH /api/users/patient/:id`    | Update patient             |

---

### 📄 Pagination & Filtering

- Supported in:

  ```
  GET /api/users/users?page=1&limit=10&role=doctor
  ```

---

## 📅 Appointment System

### ➕ Create Appointment

| Endpoint                        | Access                                   |
| ------------------------------- | ---------------------------------------- |
| `POST /api/appointments/create` | doctor, receptionist, admin, super_admin |

---

### ✅ Business Rules

- Cannot book in the past
- Doctor must exist
- Patient must exist
- Prevent duplicate appointment (same doctor + time)

---

## 🛡️ Security Layer

### Middleware Flow

1. `protect` → Verify JWT
2. `authorized(...)` → Role check
3. `validate(...)` → Zod validation
4. Controller execution

---

### 🔐 Security Features

- Password hashing (**bcrypt**)
- JWT Authentication
- Refresh Token Rotation
- Role-Based Authorization
- Centralized Error Handling

---

## 🧪 Validation (Zod)

### Examples:

- Strong password rules
- Email validation
- Date validation (no future DOB)
- Time validation (start < end)

---

## ⚙️ Environment Variables

```
PORT=5000
MONGO_URI=your_mongodb_connection

JWT_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

---

## 🔧 Installation

```bash
git clone https://github.com/Abdul-Rahman-Ahmed/dental-clinic-api

cd dental-clinic-api

npm install

npm run dev
```

---

## ⚠️ Important Notes

- Refresh Token stored in cookies → more secure
- Admin cannot modify another admin
- Email must be unique across users
- Transactions used for creating Doctor & Patient

---

## 🚧 Future Improvements

- 📊 Dashboard & Analytics
- 📩 Notifications (Email / SMS)
- 📅 Appointment Listing & Filtering
- 🧾 Medical Records
- 💳 Payments Integration
- 🔍 Search System

---

## 👨‍💻 Author

**Abdulrahman Ahmed**
Full Stack Developer (MERN Stack)

- GitHub: https://github.com/Abdul-Rahman-Ahmed
- LinkedIn: [www.linkedin.com/in/abdulrahman-ahmed-935881313](http://www.linkedin.com/in/abdulrahman-ahmed-935881313)

---

## 📄 License

This project is for learning and portfolio purposes.
