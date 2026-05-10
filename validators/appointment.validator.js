import { z } from "zod";

export const createAppointmentSchema = z.object({
  patient_id: z.string(),
  doctor_id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  notes: z.string().max(500, "very long notes").optional(),
});

export const updateAppointmentSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  notes: z.string().max(500, "very long notes").optional(),
});
