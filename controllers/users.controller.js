import asyncWrapper from "../middlewares/asyncWrapper.middleware.js";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import { hashPassword } from "../utils/password.util.js";
import mongoose from "mongoose";

export const addDoctor = asyncWrapper(async (req, res, next) => {
  const session = await mongoose.startSession();
  let doctorData;
  try {
    doctorData = await session.withTransaction(async () => {
      const { name, email, phone, password, specialization, workingHours } =
        req.body;

      const exists = await User.exists({ email }).session(session);
      if (exists)
        throw new AppError(400, requestStatus.FAIL, "This User already exists");

      const hashedPassword = await hashPassword(password, 10);

      const newUser = await User.create(
        [
          {
            name,
            email,
            phone,
            password: hashedPassword,
            role: "doctor",
          },
        ],
        { session }
      );

      await Doctor.create(
        [
          {
            specialization,
            workingHours,
            created_by: req.user.id,
            modified_by: req.user.id,
            user_id: newUser[0]._id,
          },
        ],
        { session }
      );
      return {
        code: 201,
        status: requestStatus.SUCCESS,
        message: "Doctor added successfully",
        data: {
          doctor: {
            user_id: newUser[0]._id,
            name: newUser[0].name,
            email: newUser[0].email,
            specialization,
            workingHours,
          },
        },
      };
    });
  } finally {
    session.endSession();
  }
  res.status(201).json(doctorData);
});
