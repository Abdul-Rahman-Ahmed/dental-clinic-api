import express from "express";
import { authorized } from "../middlewares/authorized.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import protect from "../middlewares/auth.middleware.js";
import {
  getPatients,
  getPatientById,
  updatePatient,
  createPatient,
  getMyProfile,
  updateMyProfile,
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

router.get("/me", protect, authorized("patient"), getMyProfile);

router.patch(
  "/me",
  protect,
  authorized("patient"),
  validate(modifyPatientSchema),
  updateMyProfile
);

router.patch(
  "/:id",
  protect,
  authorized("receptionist"),
  validate(modifyPatientSchema),
  updatePatient
);

router.get(
  "/:id",
  protect,
  authorized("super_admin", "receptionist"),
  getPatientById
);

export default router;
