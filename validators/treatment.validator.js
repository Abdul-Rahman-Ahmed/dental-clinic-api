import z from "zod";
import { TREATMENT_STATUS } from "../constants/treatment.constants.js";

export const createTreatmentValidator = z.object({
  patient_id: z.string().min(1, "Patient ID is required"),
  doctor_id: z.string().min(1, "Doctor ID is required"),
  appointment_id: z.string().min(1, "Appointment ID is required"),
  title: z.string().min(1, "Title is required"),
  diagnoses: z.string().min(1, "Diagnoses is required"),
  procedure_notes: z.string().optional(),
  tooth_number: z.coerce.number().min(1, "Tooth number is required"),
  treated_at: z.coerce.date(),
});

export const getTreatmentValidator = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).optional(),
});

export const updateTreatmentValidator = z.object({
  title: z.string().optional(),
  diagnoses: z.string().optional(),
  procedure_notes: z.string().optional(),
  tooth_number: z.coerce.number().optional(),
  treated_at: z.coerce.date().optional(),
});

export const updateTreatmentStatusValidator = z.object({
  status: z.enum(
    [
      TREATMENT_STATUS.CANCELLED,
      TREATMENT_STATUS.COMPLETED,
      TREATMENT_STATUS.IN_PROGRESS,
    ],
    {
      errorMap: () => ({
        message: `Status must be one of: ${TREATMENT_STATUS.CANCELLED}, ${TREATMENT_STATUS.COMPLETED}, ${TREATMENT_STATUS.IN_PROGRESS}`,
      }),
    }
  ),
});
