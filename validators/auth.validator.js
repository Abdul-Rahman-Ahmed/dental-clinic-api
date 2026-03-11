import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Username must be at least 3 characters ")
    .max(30, "Username must not exceed 30 characters")
    .trim(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
      "Password must include uppercase, lowercase, number and special character"
    ),

  email: z.email("Invalid email format").toLowerCase().trim(),

  role: z.enum(["super_admin", "admin", "receptionist"]),

  phone: z.string().min(10).max(15),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
