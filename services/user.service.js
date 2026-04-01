import { hashPassword } from "../utils/password.util.js";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import User from "../models/user.model.js";
import { checkUserExists } from "../utils/checkUser.util.js";

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

export const getAppointmentsService = async () => {};
