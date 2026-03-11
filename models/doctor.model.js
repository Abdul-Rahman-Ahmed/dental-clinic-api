import { model, Schema } from "mongoose";

const doctorSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    specialization: {
      type: String,
      required: true,
    },

    workingHours: {
      start: {
        type: String,
        required: true,
      },
      end: {
        type: String,
        required: true,
      },
      days: {
        type: [String],
        required: true,
      },
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
  { timestamps: true }
);

export default model("Doctor", doctorSchema);
