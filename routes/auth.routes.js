import express from "express";
import {
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
} from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import validate from "../middlewares/validate.middleware.js";
import { authorized } from "../middlewares/authorized.middleware.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/register",
  protect,
  validate(registerSchema),
  authorized("super_admin"),
  registerUser
);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", logoutUser);
router.post("/refreshToken", refreshToken);

export default router;
