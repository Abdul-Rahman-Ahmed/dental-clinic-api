import { Schema, model } from "mongoose";
import { TREATMENT_STATUS } from "../constants/treatment.constants.js";

const treatmentSchema = new Schema(
  {
    patient_id: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor_id: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    appointment_id: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    diagnoses: {
      type: String,
      required: true,
    },

    procedure_notes: {
      type: String,
    },

    tooth_number: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        TREATMENT_STATUS.PLANNED,
        TREATMENT_STATUS.IN_PROGRESS,
        TREATMENT_STATUS.COMPLETED,
        TREATMENT_STATUS.CANCELLED,
      ],
      required: true,
      default: TREATMENT_STATUS.PLANNED,
    },

    treated_at: {
      type: Date,
      required: true,
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    modified_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

treatmentSchema.index({ patient_id: 1 });
treatmentSchema.index({ doctor_id: 1 });
treatmentSchema.index({ appointment_id: 1 });
treatmentSchema.index({ status: 1 });

const Treatment = model("treatment", treatmentSchema);

export default Treatment;
