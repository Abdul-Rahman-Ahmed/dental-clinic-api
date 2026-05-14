# 🦷 Dental Clinic Management API

A layered backend API for managing dental clinic operations: authentication, role-based access control, user administration, doctor and patient records, and appointment scheduling with overlap prevention.

## ✨ Features

- JWT authentication with access tokens and refresh tokens
- HttpOnly refresh token cookie rotation
- Role-based authorization with `super_admin`, `admin`, `receptionist`, `doctor`, and `patient`
- User management for admins and receptionists
- Doctor profile creation with specialization and working hours
- Patient profile creation and self-service profile updates
- Appointment booking, rescheduling, cancellation, and completion
- Appointment overlap prevention per doctor
- Zod request validation
- Centralized error handling
- Helmet, rate limiting, logging, and cookie parsing
- MongoDB transactions for multi-document flows

## 🧰 Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Token
- Zod
- bcryptjs
- Helmet
- express-rate-limit
- Morgan
- cookie-parser

## 🏗️ Architecture

The project follows a layered structure:

- `routes`: endpoint definitions and middleware chains
- `controllers`: request/response handling
- `services`: business logic and database operations
- `models`: Mongoose schemas and indexes
- `middlewares`: auth, authorization, validation, and async error forwarding
- `validators`: Zod schemas
- `utils`: shared helpers
- `constants`: shared enums and configuration values

## 📁 Project Structure

```txt
dental-clinic-api
|-- app.js
|-- server.js
|-- config/
|   |-- db.js
|-- constants/
|   |-- appointments.constants.js
|-- controllers/
|-- middlewares/
|-- models/
|-- routes/
|-- services/
|-- utils/
|-- validators/
`-- README.MD
```

## 🔐 Authentication Flow

1. `POST /api/auth/login` verifies the user and password.
2. The server returns an access token in the JSON response.
3. The server stores a refresh token in an HttpOnly cookie named `refreshToken`.
4. The refresh token hash is stored on the user document.
5. Protected routes require `Authorization: Bearer <access_token>`.
6. `POST /api/auth/refreshToken` rotates the refresh token and returns a new access token.
7. `POST /api/auth/logout` clears the cookie and removes the stored refresh token hash.

Token lifetimes:

| Token | Lifetime | Transport |
| --- | --- | --- |
| Access token | `15m` | JSON response / Bearer header |
| Refresh token | `7d` | HttpOnly cookie |

## 🛡️ Role-Based Access Control

Authorization is enforced with `protect` and `authorized(...roles)`.

| Role | Permissions |
| --- | --- |
| `super_admin` | Register users, create admins, manage user status, access admin features |
| `admin` | Create receptionists and doctors, list users except admin/super admin, access schedules |
| `receptionist` | Create patients, update patient records, manage appointments |
| `doctor` | View own schedules and complete own appointments |
| `patient` | View and update own profile, manage own appointments |

## 🔒 Security

- Passwords are hashed with bcrypt before storage.
- Refresh tokens are stored hashed, not in plain text.
- Refresh token cookie uses `httpOnly` and `sameSite: "strict"`.
- Cookies are marked `secure` in production.
- Helmet sets common security headers.
- Rate limiting is set to `100` requests per `15` minutes.
- Validation errors and app errors are normalized by a global error handler.

## ✅ Validation

Zod is used to validate request bodies before controllers run.

Covered areas include:

- auth register and login
- admin/receptionist creation
- doctor creation
- patient creation and updates
- appointment creation and updates

## 📅 Appointment Rules

- Appointment duration is `30` minutes.
- Past appointments cannot be created or rescheduled.
- Appointment overlap is blocked per doctor.
- Only `scheduled` appointments can be updated.
- Completed or cancelled appointments cannot be changed again through cancel/complete flows.
- Patients can update or cancel only their own appointments.
- Doctors can complete only their own appointments.
- Doctors can view only schedules linked to their own doctor profile.

Overlap rule:

```js
startDate < requestedEndDate && endDate > requestedStartDate
```

## 📄 Pagination

Pagination is implemented in:

| Endpoint | Parameters |
| --- | --- |
| `GET /api/users` | `page`, `limit`, `role` |
| `POST /api/appointments/doctor/:id/schedule` | `page`, `limit` |

Default values:

- `page=1`
- `limit=10`

## 📡 API Endpoints

Base URL:

```txt
http://localhost:5000/api
```

### 🔑 Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `super_admin` | Register a new user by role |
| `POST` | `/auth/login` | Public | Login and receive access token + refresh cookie |
| `POST` | `/auth/refreshToken` | Refresh cookie | Rotate refresh token and issue new access token |
| `POST` | `/auth/logout` | Refresh cookie | Clear refresh token cookie and stored token |

### 👥 Users

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| `POST` | `/users/admin` | `super_admin` | Create an admin |
| `POST` | `/users/receptionist` | `super_admin`, `admin` | Create a receptionist |
| `GET` | `/users` | `super_admin`, `admin` | List users with pagination and optional role filter |
| `PATCH` | `/users/:id/status` | `super_admin` | Activate or deactivate a user |
| `PATCH` | `/users/:id/modifyuser` | `super_admin`, `admin` | Update name, email, or phone |

### 👨‍⚕️ Doctors

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| `POST` | `/doctors` | `super_admin`, `admin` | Create doctor user and doctor profile |
| `GET` | `/doctors` | `super_admin`, `admin` | List doctors |

### 🧑‍💼 Patients

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| `POST` | `/patients` | `super_admin`, `receptionist` | Create patient user and profile |
| `GET` | `/patients` | `super_admin`, `receptionist` | List patients |
| `GET` | `/patients/me` | `patient` | Get authenticated patient profile |
| `PATCH` | `/patients/me` | `patient` | Update authenticated patient profile |
| `PATCH` | `/patients/:id` | `receptionist` | Update a patient profile |
| `GET` | `/patients/:id` | `super_admin`, `receptionist` | Get patient by id |

### 🗓️ Appointments

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| `POST` | `/appointments` | `patient`, `receptionist` | Book an appointment |
| `PATCH` | `/appointments/:id` | `patient`, `receptionist` | Update a scheduled appointment |
| `PATCH` | `/appointments/:id/cancel` | `patient`, `receptionist` | Cancel an appointment |
| `PATCH` | `/appointments/:id/complete` | `doctor` | Complete an appointment |
| `POST` | `/appointments/doctor/:id/schedule/daily` | `doctor`, `admin`, `receptionist`, `super_admin` | Get daily schedule |
| `POST` | `/appointments/doctor/:id/schedule` | `doctor`, `admin`, `receptionist`, `super_admin` | Get paginated doctor schedule |

## 🧪 Example Requests

### 🔓 Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Password@123"
}
```

### ➕ Create Appointment

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

### 📋 Get Doctor Daily Schedule

```http
POST /api/appointments/doctor/:id/schedule/daily?date=2026-06-01
Authorization: Bearer <access_token>
```

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/dental-clinic
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
```

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Server port, defaults to `5000` |
| `NODE_ENV` | No | Enables secure cookies when set to `production` |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret |

## 🚀 Installation

```bash
git clone https://github.com/Abdul-Rahman-Ahmed/dental-clinic-api.git
cd dental-clinic-api
npm install
npm start
```

Server base URL:

```txt
http://localhost:5000
```

## 📬 Response Format

Success response example:

```json
{
  "code": 200,
  "status": "success",
  "message": "Operation completed successfully",
  "data": {}
}
```

Validation error example:

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

## 🛠️ Current Gaps

- No automated tests yet
- No OpenAPI or Swagger documentation
- No query validation for some pagination/filter endpoints
- No Docker setup
- No CI pipeline

## 👤 Author

**Abdulrahman Ahmed**

- GitHub: [Abdul-Rahman-Ahmed](https://github.com/Abdul-Rahman-Ahmed)
- Repository: [dental-clinic-api](https://github.com/Abdul-Rahman-Ahmed/dental-clinic-api)

## 📄 License

MIT
