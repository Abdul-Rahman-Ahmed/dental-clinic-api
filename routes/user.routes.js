import express from "express";
import {
  addAdmin,
  addDoctor,
  addPatient,
  addReceptionist,
} from "../controllers/users.controller.js";
import { authorized } from "../middlewares/authorized.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createDoctorFullSchema,
  createUserFullSchema,
  createPatientFullSchema,
} from "../validators/user.validator.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/doctor",
  protect,
  authorized("super_admin", "admin"),
  validate(createDoctorFullSchema),
  addDoctor
);

router.post(
  "/patient",
  protect,
  authorized("super_admin", "receptionist"),
  validate(createPatientFullSchema),
  addPatient
);

router.post(
  "/admin",
  protect,
  authorized("super_admin"),
  validate(createUserFullSchema),
  addAdmin
);

router.post(
  "/receptionist",
  protect,
  authorized("super_admin", "admin"),
  validate(createUserFullSchema),
  addReceptionist
);
export default router;
