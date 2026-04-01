import Doctor from "../models/doctor.model.js";
import { hashPassword } from "../utils/password.util.js";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import User from "../models/user.model.js";
import { checkUserExists } from "../utils/checkUser.util.js";
import { startSession } from "mongoose";

export const createDoctorService = async (data, currentUser) => {
  const session = await startSession();
  let results;
  try {
    await session.withTransaction(async () => {
      if (!currentUser)
        throw new AppError(401, requestStatus.FAIL, "Unauthorized");

      const { name, email, phone, password, specialization, workingHours } =
        data;

      if (await checkUserExists(email))
        throw new AppError(400, requestStatus.FAIL, "This User already exists");

      const hashedPassword = await hashPassword(password, 10);

      const [newUser] = await User.create(
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

      const [newDoctor] = await Doctor.create(
        [
          {
            specialization,
            workingHours,
            created_by: currentUser.id,
            modified_by: currentUser.id,
            user_id: newUser._id,
          },
        ],
        { session }
      );

      results = {
        user: newUser,
        doctor: newDoctor,
      };
    });
    return results;
  } finally {
    await session.endSession();
  }
};

export const getDoctorsService = async () => {
  return await Doctor.find().populate("user_id", "name email phone").lean();
};
