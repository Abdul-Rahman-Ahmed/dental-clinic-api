import express from "express";
import { authorized } from "../middlewares/authorized.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import protect from "../middlewares/auth.middleware.js";
import {
  cancelAppointment,
  completeAppointment,
  createAppointment,
  updateAppointment,
  getDailySchedule,
} from "../controllers/appointment.controller.js";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "../validators/appointment.validator.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorized("patient", "receptionist"),
  validate(createAppointmentSchema),
  createAppointment
);

router.patch(
  "/:id",
  protect,
  authorized("patient", "receptionist"),
  validate(updateAppointmentSchema),
  updateAppointment
);

router.patch(
  "/:id/cancel",
  protect,
  authorized("patient", "receptionist"),
  cancelAppointment
);

router.patch(
  "/:id/complete",
  protect,
  authorized("doctor"),
  completeAppointment
);

router.post("/doctor/daily", protect, authorized("doctor"), getDailySchedule);

export default router;
