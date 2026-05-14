# 🦷 Dental Clinic Management API

A production-style backend API for managing dental clinic operations, including secure authentication, role-based access control, user administration, doctor and patient records, and appointment scheduling with conflict prevention.
Built with **Node.js**, **Express.js**, **MongoDB**, **Mongoose**, **JWT**, and **Zod**, this project follows a clean layered architecture designed for maintainability, security, and recruiter-friendly code review.

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Authentication Flow](#-authentication-flow)
- [Role-Based Access Control](#-role-based-access-control)
- [Security Implementation](#-security-implementation)
- [Validation](#-validation)
- [Appointment System](#-appointment-system)
- [Pagination & Filtering](#-pagination--filtering)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Installation](#-installation)
- [Future Improvements](#-future-improvements)
- [Author](#-author)

---

## ✨ Features

- 🔐 JWT authentication with short-lived access tokens
- 🔁 Refresh token rotation using HttpOnly cookies
- 🛡️ Role-based authorization middleware
- 👥 User management for admins and receptionists
- 🧑‍⚕️ Doctor management with working hours and specialization
- 🧑‍💼 Patient management with personal profile updates
- 📅 Appointment booking, rescheduling, cancellation, and completion
- 🚫 Appointment overlap prevention per doctor
- ✅ Zod request validation
- 🔎 Pagination and role filtering where implemented
- 🧾 Centralized error handling
- ⚙️ Async wrapper middleware for controller error forwarding
- 🔒 Password hashing with bcrypt
- 🧩 MongoDB transactions for multi-document create/update workflows
- 🪖 Basic API hardening with Helmet and rate limiting

---

## 🧰 Tech Stack

| Layer            | Technology                 |
| ---------------- | -------------------------- |
| Runtime          | Node.js                    |
| Framework        | Express.js                 |
| Database         | MongoDB                    |
| ODM              | Mongoose                   |
| Authentication   | JSON Web Tokens            |
| Cookies          | cookie-parser              |
| Validation       | Zod                        |
| Password Hashing | bcryptjs                   |
| Security         | Helmet, express-rate-limit |
| Logging          | Morgan                     |

---

## 🏗️ Architecture

The API follows a **layered architecture** that separates HTTP concerns, business logic, persistence, validation, and reusable utilities.
| Layer | Responsibility |
| --- | --- |
| `routes` | Defines API endpoints and attaches middleware chains |
| `controllers` | Handles request/response formatting and delegates business logic |
| `services` | Contains domain logic, database operations, transactions, and business rules |
| `models` | Defines MongoDB schemas and indexes using Mongoose |
| `middlewares` | Handles authentication, authorization, validation, async errors, and request protection |
| `validators` | Defines Zod schemas for request payload validation |
| `utils` | Provides reusable helpers for tokens, passwords, roles, dates, errors, and appointment checks |
| `constants` | Stores shared appointment status and duration constants |
This separation keeps controllers thin, makes business logic easier to test, and reduces coupling between API routing and data access.

---

## 📁 Project Structure

```txt
dental-clinic-api
├── README.MD
├── app.js
├── server.js
├── config
│   └── db.js
├── constants
│   └── appointments.constants.js
├── controllers
│   ├── appointment.controller.js
│   ├── auth.controller.js
│   ├── doctor.controller.js
│   ├── patient.controller.js
│   └── user.controller.js
├── middlewares
│   ├── asyncWrapper.middleware.js
│   ├── auth.middleware.js
│   ├── authorized.middleware.js
│   └── validate.middleware.js
├── models
│   ├── appointment.model.js
│   ├── doctor.model.js
│   ├── patient.model.js
│   └── user.model.js
├── routes
│   ├── appointment.routes.js
│   ├── auth.routes.js
│   ├── doctor.routes.js
│   ├── patient.route.js
│   └── user.routes.js
├── services
│   ├── appointment.service.js
│   ├── auth.service.js
│   ├── doctor.service.js
│   ├── patient.service.js
│   └── user.service.js
├── utils
│   ├── appError.util.js
│   ├── checkOverlap.util.js
│   ├── checkUser.util.js
│   ├── createToken.util.js
│   ├── date.util.js
│   ├── formatDate.util.js
│   ├── password.util.js
│   ├── requestStatus.util.js
│   ├── roles.util.js
│   └── validateAppointmentStatus.util.js
└── validators
    ├── appointment.validator.js
    ├── auth.validator.js
    ├── doctor.validator.js
    ├── patient.validator.js
    └── user.validator.js
```

---

## 🔐 Authentication Flow

The API uses a JWT-based authentication flow with refresh token rotation.

1. A user logs in with email and password.
2. The server verifies the user exists, is active, and the password matches the stored bcrypt hash.
3. The server returns a short-lived access token in the JSON response.
4. The server stores the refresh token in an **HttpOnly cookie** named `refreshToken`.
5. The refresh token is hashed before being stored on the user document.
6. Protected routes require the access token in the `Authorization` header.
7. Refreshing tokens rotates the refresh token and replaces the stored hash.
8. Logout clears the refresh cookie and removes the stored refresh token.
   Access token usage:

```http
Authorization: Bearer <access_token>
```

Token lifetime:
| Token | Lifetime | Transport |
| --- | --- | --- |
| Access Token | 15 minutes | JSON response / Bearer header |
| Refresh Token | 7 days | HttpOnly cookie |

---

## 🧑‍⚖️ Role-Based Access Control

Authorization is enforced using the `authorized(...roles)` middleware after authentication.
Implemented roles:
| Role | Purpose |
| --- | --- |
| `super_admin` | Highest administrative role with user status control and admin creation access |
| `admin` | Administrative access to users, doctors, and schedules with restricted admin modification rules |
| `doctor` | Access to personal schedule views and appointment completion |
| `receptionist` | Patient creation, patient updates, and appointment scheduling operations |
| `patient` | Personal profile access and appointment booking/update/cancellation |
Example middleware chain:

```js
router.post(
  "/",
  protect,
  authorized("patient", "receptionist"),
  validate(createAppointmentSchema),
  createAppointment
);
```

---

## 🛡️ Security Implementation

Security controls implemented in the API:

- **Password hashing:** User passwords are hashed with bcrypt before storage.
- **JWT access control:** Protected routes require a valid bearer access token.
- **Refresh token rotation:** A new refresh token is issued whenever `/api/auth/refreshToken` is used.
- **Hashed refresh tokens:** Refresh tokens are stored as hashes, not plain text.
- **HttpOnly cookies:** Refresh tokens are stored in HttpOnly cookies to reduce client-side script exposure.
- **Secure cookie option:** Cookies are marked `secure` when `NODE_ENV=production`.
- **Strict SameSite policy:** Refresh token cookie uses `sameSite: "strict"`.
- **Helmet:** Adds common HTTP security headers.
- **Rate limiting:** Limits requests to 100 requests per 15 minutes.
- **Centralized error handling:** Normalizes validation, duplicate key, JWT, and application errors.
- **Input validation:** Zod schemas validate request bodies before controllers execute.

---

## ✅ Validation

Request validation is handled with **Zod** using a reusable `validate` middleware. Invalid requests return a structured `400` response with field-level validation details.
Validation examples:
| Area | Rules |
| --- | --- |
| Auth registration | Name, email, phone, strong password, allowed registration roles |
| Login | Valid email and required password |
| Doctor creation | User credentials, specialization, working hours, valid working days |
| Patient creation | User credentials, gender, past date of birth |
| Appointment creation | Patient ID, doctor ID, `YYYY-MM-DD` date, `HH:mm` start time, optional notes |
| Appointment update | Optional date, start time, and notes |
Password validation requires uppercase, lowercase, number, and special character patterns for protected account creation flows.

---

## 📅 Appointment System

Appointments are stored with:

- `patient_id`
- `doctor_id`
- `startDate`
- `endDate`
- `status`
- `notes`
- `created_by`
- `modified_by`
  Appointment statuses:
  | Status | Description |
  | --- | --- |
  | `scheduled` | Default status for booked appointments |
  | `completed` | Marked by a doctor after the appointment starts |
  | `cancelled` | Cancelled by an allowed user |
  | `no_show` | Defined in the model status enum |
  Scheduling rules implemented:
- Appointments are created as **30-minute sessions**.
- Past appointments cannot be booked.
- Scheduled appointments can be rescheduled.
- Completed or cancelled appointments cannot be cancelled/completed again.
- Appointments cannot be completed before their start time.
- Doctor schedules can be retrieved daily or paginated.
- Doctors can only view schedules linked to their own doctor profile.
- Appointment overlap is prevented with a MongoDB query:

```js
startDate < requestedEndDate && endDate > requestedStartDate;
```

## Indexes are defined for doctor/date lookup, patient lookup, and status lookup.

## 🔎 Pagination & Filtering

Pagination is implemented where currently supported by the API.
| Endpoint | Query Parameters | Behavior |
| --- | --- | --- |
| `GET /api/users` | `page`, `limit`, `role` | Paginates users and optionally filters by role |
| `POST /api/appointments/doctor/:id/schedule` | `page`, `limit` | Returns paginated doctor appointment schedule |
Default pagination values:
| Parameter | Default |
| --- | --- |
| `page` | `1` |
| `limit` | `10` |

---

## 📡 API Endpoints

Base URL:

```txt
http://localhost:5000/api
```

### Auth

| Method | Endpoint             | Access         | Description                                     |
| ------ | -------------------- | -------------- | ----------------------------------------------- |
| `POST` | `/auth/register`     | Public         | Register an allowed non-super-admin user role   |
| `POST` | `/auth/login`        | Public         | Login and receive access token + refresh cookie |
| `POST` | `/auth/refreshToken` | Refresh Cookie | Rotate refresh token and issue new access token |
| `POST` | `/auth/logout`       | Refresh Cookie | Clear refresh token cookie and stored token     |

### Users

| Method  | Endpoint                | Roles                  | Description                                            |
| ------- | ----------------------- | ---------------------- | ------------------------------------------------------ |
| `POST`  | `/users/admin`          | `super_admin`          | Create an admin user                                   |
| `POST`  | `/users/receptionist`   | `super_admin`, `admin` | Create a receptionist user                             |
| `GET`   | `/users`                | `super_admin`, `admin` | List users with pagination and optional role filtering |
| `PATCH` | `/users/:id/status`     | `super_admin`          | Activate or deactivate a user                          |
| `PATCH` | `/users/:id/modifyuser` | `super_admin`, `admin` | Update user name, email, or phone                      |

### Doctors

| Method | Endpoint   | Roles                  | Description                             |
| ------ | ---------- | ---------------------- | --------------------------------------- |
| `POST` | `/doctors` | `super_admin`, `admin` | Create a doctor user and doctor profile |
| `GET`  | `/doctors` | `super_admin`, `admin` | List doctors with linked user details   |

### Patients

| Method  | Endpoint        | Roles                         | Description                                |
| ------- | --------------- | ----------------------------- | ------------------------------------------ |
| `POST`  | `/patients`     | `super_admin`, `receptionist` | Create a patient user and patient profile  |
| `GET`   | `/patients`     | `super_admin`, `receptionist` | List patients with linked user details     |
| `GET`   | `/patients/me`  | `patient`                     | Get the authenticated patient's profile    |
| `PATCH` | `/patients/me`  | `patient`                     | Update the authenticated patient's profile |
| `PATCH` | `/patients/:id` | `receptionist`                | Update a patient profile                   |
| `GET`   | `/patients/:id` | `super_admin`, `receptionist` | Get a patient by ID                        |

### Appointments

| Method  | Endpoint                                  | Roles                                            | Description                                              |
| ------- | ----------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| `POST`  | `/appointments`                           | `patient`, `receptionist`                        | Book an appointment                                      |
| `PATCH` | `/appointments/:id`                       | `patient`, `receptionist`                        | Reschedule/update a scheduled appointment                |
| `PATCH` | `/appointments/:id/cancel`                | `patient`, `receptionist`                        | Cancel an appointment                                    |
| `PATCH` | `/appointments/:id/complete`              | `doctor`                                         | Mark an appointment as completed                         |
| `POST`  | `/appointments/doctor/:id/schedule/daily` | `doctor`, `admin`, `receptionist`, `super_admin` | Get a doctor's scheduled appointments for a specific day |
| `POST`  | `/appointments/doctor/:id/schedule`       | `doctor`, `admin`, `receptionist`, `super_admin` | Get a paginated doctor schedule                          |

---

## 🧪 Example Requests

### Login

```http
POST /api/auth/login
Content-Type: application/json
{
  "email": "admin@example.com",
  "password": "Password@123"
}
```

### Create Appointment

```http
POST /api/appointments
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "patient_id": "patient_profile_id",
  "doctor_id": "doctor_profile_id",
  "date": "2026-06-01",
  "startTime": "10:30",
  "notes": "Routine dental checkup"
}
```

### Get Doctor Daily Schedule

```http
POST /api/appointments/doctor/:id/schedule/daily?date=2026-06-01
Authorization: Bearer <access_token>
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/dental-clinic
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
```

| Variable             | Required | Description                                     |
| -------------------- | -------- | ----------------------------------------------- |
| `PORT`               | No       | Server port. Defaults to `5000`                 |
| `NODE_ENV`           | No       | Enables secure cookies when set to `production` |
| `MONGO_URI`          | Yes      | MongoDB connection string                       |
| `JWT_SECRET`         | Yes      | Secret used to sign access tokens               |
| `JWT_REFRESH_SECRET` | Yes      | Secret used to sign refresh tokens              |

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Abdul-Rahman-Ahmed/dental-clinic-api.git
cd dental-clinic-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env` and add the required variables listed above.

### 4. Start the server

```bash
npm start
```

The API will be available at:

```txt
http://localhost:5000
```

---

## 🧾 Response Format

Successful responses generally follow this structure:

```json
{
  "code": 200,
  "status": "success",
  "message": "Operation completed successfully",
  "data": {}
}
```

Validation and application errors are returned through the centralized error handler:

```json
{
  "status": "fail",
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 🛣️ Future Improvements

- Add automated unit and integration tests
- Add Swagger/OpenAPI documentation
- Add request query validation for pagination and filters
- Add more advanced appointment availability rules based on doctor working hours
- Add audit logs for sensitive administrative actions
- Add Docker configuration for local development
- Add CI workflow for linting and testing
- Add refresh token reuse detection

---

## 👤 Author

**Abdulrahman Ahmed**

- GitHub: [Abdul-Rahman-Ahmed](https://github.com/Abdul-Rahman-Ahmed)
- Repository: [dental-clinic-api](https://github.com/Abdul-Rahman-Ahmed/dental-clinic-api)

---

## 📄 License

This project is licensed under the **MIT License**.
