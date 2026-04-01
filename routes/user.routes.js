import express from "express";
import {
  addAdmin,
  addReceptionist,
  status,
  getUsers,
  modifiyUser,
} from "../controllers/user.controller.js";
import { authorized } from "../middlewares/authorized.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createUserFullSchema,
  modifyUserSchema,
} from "../validators/user.validator.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

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

router.get("/", protect, authorized("super_admin", "admin"), getUsers);

router.patch("/:id/status", protect, authorized("super_admin"), status);

router.patch(
  "/:id/modifyuser",
  protect,
  authorized("super_admin", "admin"),
  validate(modifyUserSchema),
  modifiyUser
);

export default router;
