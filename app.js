import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import requestStatus from "./utils/requestStatus.util.js";
import AppError from "./utils/appError.util.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
// Handle wrong routes
app.use((req, res, next) => {
  return res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  if (err.name === "JsonWebTokenError") {
    err = new AppError(401, requestStatus.FAIL, "Invalid token");
  }

  if (err.code === 11000) {
    err = new AppError(400, requestStatus.FAIL, "Duplicate field value");
  }

  return res.status(err.codeStatus ?? 500).json({
    status: err.errorStatus ?? requestStatus.ERROR,
    code: err.codeStatus ?? 500,
    message: err.message ?? "Inrernal Server Error",
    errors: err.errors ?? null,
  });
});

export default app;
