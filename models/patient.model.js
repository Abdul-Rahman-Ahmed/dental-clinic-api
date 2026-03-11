import { model, Schema } from "mongoose";

const patientSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medical_notes: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },

    age: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default model("Patient", patientSchema);
