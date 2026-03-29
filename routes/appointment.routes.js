import express from "express";
import { authorized } from "../middlewares/authorized.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import protect from "../middlewares/auth.middleware.js";
import { createAppointment } from "../controllers/appointment.controller.js";
import { createAppointmentSchema } from "../validators/appointment.validator.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  authorized("doctor", "receptionist", "admin", "super_admin"),
  validate(createAppointmentSchema),
  createAppointment
);

export default router;
