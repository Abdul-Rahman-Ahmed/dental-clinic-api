import express from "express";
import { createUser } from "../controllers/users.controller.js";
import { authorized } from "../middlewares/authorized.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createUserSchema } from "../validators/user.validator.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/createUser",
  protect,
  authorized("admin"),
  validate(createUserSchema),
  createUser
);

export default router;
