import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters ")
    .max(20, "Username must not exceed 20 characters")
    .trim(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
      "Password must include uppercase, lowercase, number and special character"
    ),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
