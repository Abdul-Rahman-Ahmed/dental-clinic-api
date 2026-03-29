import express from "express";
import {
  addAdmin,
  addDoctor,
  addPatient,
  addReceptionist,
  status,
  getDoctors,
  getPatients,
  getUsers,
  modifiyUser,
  getPatient,
  modifyPatient,
} from "../controllers/users.controller.js";
import { authorized } from "../middlewares/authorized.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createDoctorFullSchema,
  createUserFullSchema,
  createPatientFullSchema,
  modifyUserSchema,
  modifyPatientSchema,
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

router.get("/users", protect, authorized("super_admin", "admin"), getUsers);
router.get("/doctors", protect, authorized("super_admin", "admin"), getDoctors);
router.get(
  "/patients",
  protect,
  authorized("super_admin", "receptionist"),
  getPatients
);
router.get(
  "/patient/:id",
  protect,
  authorized("super_admin", "receptionist"),
  getPatient
);

router.patch("/:id/status", protect, authorized("super_admin"), status);
router.patch(
  "/:id/modifyuser",
  protect,
  authorized("super_admin", "admin"),
  validate(modifyUserSchema),
  modifiyUser
);
router.patch(
  "/patient/:id",
  protect,
  authorized("receptionist"),
  validate(modifyPatientSchema),
  modifyPatient
);
export default router;
