import Doctor from "../models/doctor.model.js";
import { hashPassword } from "../utils/password.util.js";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
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

export const createAdminService = async (data) => {
  const { name, email, phone, password } = data;
  if (await checkUserExists(email))
    throw new AppError(400, requestStatus.FAIL, "This Admin already exists");

  const hashedPassword = await hashPassword(password, 10);

  const newUser = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: "admin",
  });

  return newUser;
};

export const createReceptionistService = async (data) => {
  const { name, email, phone, password } = data;
  if (await checkUserExists(email))
    throw new AppError(400, requestStatus.FAIL, "This user already exists");

  const hashedPassword = await hashPassword(password, 10);

  const newUser = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: "receptionist",
  });

  return newUser;
};

export const getUsersService = async (page = 1, limit = 10, currentRole) => {
  const skip = (page - 1) * limit;
  let query = {};

  if (currentRole === "admin") {
    query.role = { $nin: ["admin", "super_admin"] };
  }
  return await User.find(query).skip(skip).limit(limit).lean();
};

export const getUsersByRoleService = async (role, page, limit, currentRole) => {
  if (currentRole === "admin" && (role === "super_admin" || "admin"))
    throw new AppError(403, requestStatus.FAIL, "Not authorized");
  const skip = (page - 1) * limit;
  return await User.find({ role }).skip(skip).limit(limit).lean();
};

export const getDoctorsService = async () => {
  return await Doctor.find().populate("user_id", "name email phone").lean();
};

export const getPatientsService = async () => {
  return await Patient.find().populate("user_id", "name email phone").lean();
};

export const statusService = async (id, status) => {
  try {
    return await User.findOneAndUpdate(
      { _id: id, isActive: { $ne: status } },
      { isActive: status },
      { returnDocument: "after" }
    );
  } catch (err) {
    throw new AppError(400, requestStatus.FAIL, "Invalid id");
  }
};

export const modifyUserService = async (id, data, currentRole) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError(404, requestStatus.FAIL, "User not found");
  }

  if (currentRole === "admin" && user.role === "admin") {
    throw new AppError(
      403,
      requestStatus.FAIL,
      "Admins cannot modify other admins"
    );
  }

  Object.assign(user, data);
  await user.save();

  return user;
};

export const getPatientService = async (id) => {
  const results = await Patient.findById(id)
    .populate("user_id", "name email phone")
    .lean();
  if (results === null)
    throw new AppError(400, requestStatus.FAIL, "Invalid id");
  return results;
};

export const modifyPatientService = async (id, data) => {
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

export const getAppointmentsService = async () => {};
