import express from "express";
import { registerAdmin, loginAdmin } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import validate from "../middlewares/validate.js";
const router = express.Router();

router.post("/register", validate(registerSchema), registerAdmin);
router.post("/login", validate(loginSchema), loginAdmin);

export default router;
