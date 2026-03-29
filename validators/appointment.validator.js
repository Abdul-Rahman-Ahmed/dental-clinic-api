import { z } from "zod";

export const createAppointmentSchema = z.object({
  patient_id: z.string(),
  doctor_id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z
    .object({
      start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    })
    .refine((data) => data.start < data.end, {
      message: "End time must be after start time",
      path: ["end"],
    }),
  notes: z.string().max(500, "very long notes").optional(),
});
