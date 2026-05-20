import express from "express";
import {
  createTreatmentValidator,
  updateTreatmentValidator,
  updateTreatmentStatusValidator,
  getTreatmentQueryValidator,
} from "../validators/treatment.validator.js";
import {
  createTreatment,
  getTreatments,
  getTreatmentById,
  updateTreatment,
  updateTreatmentStatus,
} from "../controllers/treatment.controller.js";
import validate from "../middlewares/validate.middleware.js";
import protect from "../middlewares/auth.middleware.js";
import { authorized } from "../middlewares/authorized.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorized("doctor"),
  validate(createTreatmentValidator),
  createTreatment
);

router.get(
  "/",
  protect,
  authorized("super_admin", "admin", "receptionist", "doctor"),
  validate(getTreatmentQueryValidator, "query"),
  getTreatments
);

router.get(
  "/:id",
  protect,
  authorized("super_admin", "admin", "receptionist", "doctor"),
  getTreatmentById
);

router.patch(
  "/:id",
  protect,
  authorized("doctor"),
  validate(updateTreatmentValidator),
  updateTreatment
);

router.patch(
  "/:id/status",
  protect,
  authorized("doctor"),
  validate(updateTreatmentStatusValidator),
  updateTreatmentStatus
);

export default router;
