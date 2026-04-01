import express from "express";
import { authorized } from "../middlewares/authorized.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import protect from "../middlewares/auth.middleware.js";
import {
  getPatients,
  getPatientById,
  updatePatient,
  createPatient,
} from "../controllers/patient.controller.js";
import {
  createPatientFullSchema,
  modifyPatientSchema,
} from "../validators/patient.validator.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorized("super_admin", "receptionist"),
  validate(createPatientFullSchema),
  createPatient
);

router.get(
  "/",
  protect,
  authorized("super_admin", "receptionist"),
  getPatients
);

router.get(
  "/:id",
  protect,
  authorized("super_admin", "receptionist"),
  getPatientById
);

router.patch(
  "/:id",
  protect,
  authorized("receptionist"),
  validate(modifyPatientSchema),
  updatePatient
);

export default router;
