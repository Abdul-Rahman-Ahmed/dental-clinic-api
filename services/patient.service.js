import Patient from "../models/patient.model.js";
import { hashPassword } from "../utils/password.util.js";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import User from "../models/user.model.js";
import { checkUserExists } from "../utils/checkUser.util.js";
import { startSession } from "mongoose";

export const createPatientService = async (data, currentUser) => {
  const session = await startSession();
  let results;
  try {
    await session.withTransaction(async () => {
      if (!currentUser)
        throw new AppError(401, requestStatus.FAIL, "Unauthorized");
      const { name, email, phone, password, gender, dateOfBirth } = data;

      if (await checkUserExists(email))
        throw new AppError(400, requestStatus.FAIL, "This user already exsits");

      const hashedPassword = await hashPassword(password, 10);

      const [newUser] = await User.create(
        [
          {
            name,
            email,
            phone,
            password: hashedPassword,
            role: "patient",
          },
        ],
        { session }
      );

      const [newPatient] = await Patient.create(
        [
          {
            gender,
            dateOfBirth,
            created_by: currentUser.id,
            modified_by: currentUser.id,
            user_id: newUser._id,
          },
        ],
        { session }
      );

      results = { user: newUser, patient: newPatient };
    });
    return results;
  } finally {
    await session.endSession();
  }
};

export const getPatientsService = async () => {
  return await Patient.find().populate("user_id", "name email phone").lean();
};

export const getPatientByIdService = async (id) => {
  const results = await Patient.findById(id)
    .populate("user_id", "name email phone")
    .lean();
  if (results === null)
    throw new AppError(400, requestStatus.FAIL, "Invalid id");
  return results;
};

export const updatePatientService = async (id, data) => {
  const session = await startSession();
  let results;
  let { name, email, phone, medical_notes } = data;
  if (!name && !email && !phone && !medical_notes)
    throw new AppError(400, requestStatus.FAIL, "isn't data to update");

  const patientUpdate = {};
  if (medical_notes !== undefined) patientUpdate.medical_notes = medical_notes;

  const userUpdate = {};
  if (name !== undefined) userUpdate.name = name;
  if (email !== undefined) userUpdate.email = email;
  if (phone !== undefined) userUpdate.phone = phone;

  try {
    await session.withTransaction(async () => {
      const newPatient = await Patient.findOneAndUpdate(
        { _id: id },
        patientUpdate,
        { returnDocument: "after", session }
      );

      if (!newPatient)
        throw new AppError(400, requestStatus.FAIL, "Patient not found");

      console.log(newPatient.user_id);
      const exists = await User.exists({
        email,
        _id: { $ne: newPatient.user_id },
      });
      if (email && exists)
        throw new AppError(
          400,
          requestStatus.FAIL,
          "this email is already exsits"
        );

      const updateUser = await User.findOneAndUpdate(
        { _id: newPatient.user_id },
        userUpdate,
        { returnDocument: "after", session }
      );

      if (!updateUser)
        throw new AppError(400, requestStatus.FAIL, "user not found");

      results = {
        newPatient,
        updateUser,
      };
    });
    return results;
  } finally {
    session.endSession();
  }
};
