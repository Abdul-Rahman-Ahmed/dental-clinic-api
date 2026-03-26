import Doctor from "../models/doctor.model.js";
import { hashPassword } from "../utils/password.util.js";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import { checkUserExists } from "../utils/checkUser.util.js";

export const createDoctorService = async (data, currentUser) => {
  try {
    if (!currentUser)
      throw new AppError(401, requestStatus.FAIL, "Unauthorized");

    const { name, email, phone, password, specialization, workingHours } = data;

    if (await checkUserExists(email))
      throw new AppError(400, requestStatus.FAIL, "This User already exists");

    const hashedPassword = await hashPassword(password, 10);

    const [newUser] = await User.create([
      {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "doctor",
      },
    ]);

    const [newDoctor] = await Doctor.create([
      {
        specialization,
        workingHours,
        created_by: currentUser.id,
        modified_by: currentUser.id,
        user_id: newUser._id,
      },
    ]);

    return {
      user: newUser,
      doctor: newDoctor,
    };
  } catch (err) {
    await User.deleteOne({ email: data.email });
    throw err;
  }
};

export const createPatientService = async (data, currentUser) => {
  try {
    if (!currentUser)
      throw new AppError(401, requestStatus.FAIL, "Unauthorized");
    const { name, email, phone, password, gender, dateOfBirth } = data;

    if (await checkUserExists(email))
      throw new AppError(400, requestStatus.FAIL, "This user already exsits");

    const hashedPassword = await hashPassword(password, 10);

    const [newUser] = await User.create([
      {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "patient",
      },
    ]);

    const [newPatient] = await Patient.create([
      {
        gender,
        dateOfBirth,
        created_by: currentUser.id,
        modified_by: currentUser.id,
        user_id: newUser._id,
      },
    ]);

    return { user: newUser, patient: newPatient };
  } catch (err) {
    await User.deleteOne({ email: data.email });
    throw err;
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

export const getUsersService = async () => {
  return await User.find();
};

export const getAdminsService = async () => {
  return await User.find({ role: "admin" });
};

export const getReceptionistService = async () => {
  return await User.find({ role: "receptionist" });
};

export const getDoctorsService = async () => {
  return await Doctor.find().populate("user_id");
};

export const getPatinetService = async () => {
  return await Patient.find().populate("user_id");
};
