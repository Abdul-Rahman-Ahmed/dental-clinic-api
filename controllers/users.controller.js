import asyncWrapper from "../middlewares/asyncWrapper.middleware.js";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import User from "../models/user.model.js";
import { hashPassword } from "../utils/password.util.js";
import roles from "../utils/roles.util.js";

export const createUser = asyncWrapper(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;

  const exists = await User.exists({ email });
  if (exists)
    return next(
      new AppError(400, requestStatus.FAIL, "This User already exsits")
    );

  if (!roles.includes(role))
    return next(new AppError(400, requestStatus.FAIL, "Invalid Role"));

  const hashedPassword = await hashPassword(password, 10);

  await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role,
  });

  res.status(201).json({
    code: 201,
    status: requestStatus.SUCCESS,
    message: "successfuly added",
  });
});

export const updateUser = asyncWrapper(async (req, res, next) => {});
