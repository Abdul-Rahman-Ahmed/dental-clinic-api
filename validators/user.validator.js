import { z } from "zod";
import roles from "../utils/roles.util.js";

export const createUserSchema = z
  .object({
    name: z
      .string()
      .min(3, "Username must be at least 3 characters ")
      .max(20, "Username must not exceed 20 characters")
      .trim(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
        "Password must include uppercase, lowercase, number and special character"
      ),

    email: z.string().email("Invalid email format").toLowerCase().trim(),
    role: z.enum(roles),
    phone: z
      .string()
      .min(11, "Phone number too short")
      .max(15, "Phone number too long")
      .trim(),
  })
  .strict();

export const createDoctorSchema = z.object({
  workingHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid start time"),
    end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid end time"),
  }),
  specialization: z.string().min(4, "specializaation is required"),
});
