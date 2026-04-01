import express from "express";
import { createDoctor, getDoctors } from "../controllers/doctor.controller.js";
import { authorized } from "../middlewares/authorized.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createDoctorFullSchema } from "../validators/user.validator.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorized("super_admin", "admin"),
  validate(createDoctorFullSchema),
  createDoctor
);

router.get("/", protect, authorized("super_admin", "admin"), getDoctors);

export default router;
