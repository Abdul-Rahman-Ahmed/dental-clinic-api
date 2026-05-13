import mongoose from "mongoose";
import { APPOINTMENT_STATUS } from "../constants/appointments.constants.js";

const appointmentSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        APPOINTMENT_STATUS.CANCELLED,
        APPOINTMENT_STATUS.COMPLETED,
        APPOINTMENT_STATUS.NO_SHOW,
        APPOINTMENT_STATUS.SCHEDULED,
      ],
      default: APPOINTMENT_STATUS.SCHEDULED,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    modified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({
  doctor_id: 1,
  startDate: 1,
});

appointmentSchema.index({
  patient_id: 1,
});

appointmentSchema.index({
  status: 1,
});
export default mongoose.model("Appointment", appointmentSchema);
