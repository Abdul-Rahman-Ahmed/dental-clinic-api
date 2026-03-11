import express from "express";
import { addDoctor } from "../controllers/users.controller.js";
import { authorized } from "../middlewares/authorized.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createDoctorSchema,
  createUserSchema,
} from "../validators/user.validator.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/doctor",
  protect,
  authorized("super_admin"),
  validate(createUserSchema),
  validate(createDoctorSchema),
  addDoctor
);
export default router;
