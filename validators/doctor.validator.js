import { z } from "zod";

export const createDoctorFullSchema = z
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
    workingHours: z
      .object({
        start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
        end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
        days: z.array(
          z.enum(["sat", "sun", "mon", "tue", "wed", "thu", "fri"])
        ),
      })
      .refine((data) => data.start < data.end, {
        message: "End time must be after start time",
        path: ["end"],
      }),
    specialization: z.string().min(4, "specializaation is required"),
  })
  .strict();
