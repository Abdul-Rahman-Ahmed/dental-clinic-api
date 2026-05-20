# 🦷 Dental Clinic Management API

A backend API for running a dental clinic system with authentication, role-based access control, doctor and patient management, and appointment scheduling with overlap prevention.

Built with `Node.js`, `Express`, `MongoDB`, `Mongoose`, `JWT`, and `Zod`.

## ✨ Highlights

- `JWT` access authentication
- Refresh token rotation with `HttpOnly` cookies
- Role-based authorization for `super_admin`, `admin`, `receptionist`, `doctor`, and `patient`
- Admin, doctor, and patient management flows
- Appointment booking, rescheduling, cancellation, and completion
- Doctor schedule lookup with daily and paginated views
- Appointment overlap prevention
- Request validation with `Zod`
- Centralized error handling
- Security middleware with `helmet`, `cors`, `cookie-parser`, `morgan`, and `express-rate-limit`

## 🧰 Tech Stack

| Layer | Tools |
| --- | --- |
| Runtime | `Node.js` |
| Framework | `Express` |
| Database | `MongoDB` |
| ODM | `Mongoose` |
| Auth | `jsonwebtoken` |
| Validation | `Zod` |
| Security | `helmet`, `express-rate-limit`, `cookie-parser`, `cors` |
| Logging | `morgan` |
| Dev | `nodemon` |

## 🏗️ Architecture

The project uses a layered structure to keep responsibilities separate:

- `routes/` defines endpoints and middleware chains
- `controllers/` handles request and response formatting
- `services/` contains business logic and database operations
- `models/` defines Mongoose schemas and indexes
- `validators/` holds `Zod` schemas
- `middlewares/` contains auth, authorization, validation, and async wrappers
- `utils/` provides shared helpers
- `constants/` stores shared enums and configuration values

## 📁 Project Structure

```txt
dental-clinic-api
|-- app.js
|-- server.js
|-- config/
|-- constants/
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

1. A user logs in through `POST /api/auth/login`.
2. The API verifies the email, password, and active status.
3. A short-lived access token is returned in the JSON response.
4. A refresh token is stored in an `HttpOnly` cookie named `refreshToken`.
5. The refresh token is hashed before being stored in the database.
6. Protected routes require `Authorization: Bearer <access_token>`.
7. `POST /api/auth/refreshToken` rotates the refresh token and returns a new access token.
8. `POST /api/auth/logout` clears the cookie and removes the stored refresh token.

### Token Lifetime

| Token | Lifetime | Transport |
| --- | --- | --- |
| Access token | `15m` | JSON response / Bearer header |
| Refresh token | `7d` | `HttpOnly` cookie |

## 🛡️ Roles and Access

Authorization is enforced with `protect` and `authorized(...roles)`.

| Role | Main Capabilities |
| --- | --- |
| `super_admin` | Register users, create admins, manage user status, access administrative features |
| `admin` | Create receptionists and doctors, view users except privileged roles, access schedules |
| `receptionist` | Create patients, update patient records, manage appointments |
| `doctor` | View own schedules and complete own appointments |
| `patient` | View profile, update profile, and manage own appointments |

## 📅 Appointment Rules

- Each appointment session is `30` minutes
- Past appointments cannot be created or rescheduled
- Doctors cannot have overlapping appointments
- Only `scheduled` appointments can be updated
- Cancelled or completed appointments cannot be completed/cancelled again
- Patients can update or cancel only their own appointments
- Doctors can complete only appointments linked to their own doctor profile
- Doctors can view only schedules linked to their own profile

### Overlap Logic

```js
startDate < requestedEndDate && endDate > requestedStartDate
```

## ✅ Validation

Request validation is handled using `Zod`.

Covered flows include:

- auth register and login
- user creation and modification
- doctor creation
- patient creation and profile updates
- appointment creation and update

## 🔒 Security

- Passwords are hashed with `bcryptjs`
- Refresh tokens are stored hashed, not as plain text
- Refresh cookie uses `httpOnly`
- Refresh cookie uses `sameSite: "strict"`
- Cookies become `secure` in production
- Global rate limit: `100` requests per `15` minutes
- Centralized error handling for validation and runtime errors

## 📄 Pagination

Pagination is currently available in:

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
| `POST` | `/auth/login` | Public | Login and receive access token plus refresh cookie |
| `POST` | `/auth/refreshToken` | Refresh cookie | Rotate refresh token and issue a new access token |
| `POST` | `/auth/logout` | Refresh cookie | Clear refresh cookie and stored token |

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
| `POST` | `/doctors` | `super_admin`, `admin` | Create doctor account and doctor profile |
| `GET` | `/doctors` | `super_admin`, `admin` | List doctors |

### 🧑‍💼 Patients

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| `POST` | `/patients` | `super_admin`, `receptionist` | Create patient account and profile |
| `GET` | `/patients` | `super_admin`, `receptionist` | List patients |
| `GET` | `/patients/me` | `patient` | Get current patient profile |
| `PATCH` | `/patients/me` | `patient` | Update current patient profile |
| `PATCH` | `/patients/:id` | `receptionist` | Update patient profile |
| `GET` | `/patients/:id` | `super_admin`, `receptionist` | Get patient by id |

### 🗓️ Appointments

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| `POST` | `/appointments` | `patient`, `receptionist` | Book an appointment |
| `PATCH` | `/appointments/:id` | `patient`, `receptionist` | Update a scheduled appointment |
| `PATCH` | `/appointments/:id/cancel` | `patient`, `receptionist` | Cancel an appointment |
| `PATCH` | `/appointments/:id/complete` | `doctor` | Complete an appointment |
| `POST` | `/appointments/doctor/:id/schedule/daily` | `doctor`, `admin`, `receptionist`, `super_admin` | Get doctor daily schedule |
| `POST` | `/appointments/doctor/:id/schedule` | `doctor`, `admin`, `receptionist`, `super_admin` | Get paginated doctor schedule |

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

### Get Daily Doctor Schedule

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
| `PORT` | No | Defaults to `5000` |
| `NODE_ENV` | No | Enables secure cookies in production |
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

Server URL:

```txt
http://localhost:5000
```

## 📬 Response Shape

Success example:

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
- No Swagger or OpenAPI docs yet
- No Docker setup yet
- No CI workflow yet
- Some query validation is still limited

## 👤 Author

**Abdulrahman Ahmed**

- GitHub: [Abdul-Rahman-Ahmed](https://github.com/Abdul-Rahman-Ahmed)
- Repository: [dental-clinic-api](https://github.com/Abdul-Rahman-Ahmed/dental-clinic-api)

## 📄 License

MIT
