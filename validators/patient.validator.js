import { z } from "zod";

export const createPatientFullSchema = z
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
    phone: z
      .string()
      .min(11, "Phone number too short")
      .max(15, "Phone number too long")
      .trim(),

    gender: z.enum(["male", "female"]),

    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((date) => {
        const d = new Date(date);
        return d < new Date();
      }, "Date of birth cannot be in the future"),
  })
  .strict();

export const modifyPatientSchema = z
  .object({
    name: z
      .string()
      .min(3, "Username must be at least 3 characters ")
      .max(20, "Username must not exceed 20 characters")
      .trim()
      .optional(),

    email: z
      .string()
      .email("Invalid email format")
      .toLowerCase()
      .trim()
      .optional(),

    phone: z
      .string()
      .min(11, "Phone number too short")
      .max(15, "Phone number too long")
      .trim()
      .optional(),

    medical_notes: z
      .string()
      .min(15, "short note")
      .max(60, "long note")
      .trim()
      .optional(),
  })
  .strict();
