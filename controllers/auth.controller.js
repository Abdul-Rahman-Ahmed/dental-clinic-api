import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import asyncWrapper from "../middlewares/asyncWrapper.middleware.js";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import { comparePassword, hashPassword } from "../utils/password.util.js";

export const registerUser = asyncWrapper(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;

  const exists = await User.exists({ email });

  if (exists)
    return next(new AppError(400, requestStatus.FAIL, "User already exists"));

  if (role === "super_admin")
    return next(new AppError(403, requestStatus.FAIL, "Not allowed"));

  const hashedPassword = await hashPassword(password, 10);

  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role,
  });

  res.status(201).json({
    code: 201,
    status: requestStatus.SUCCESS,
    message: "User created successfully",
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
    },
  });
});

export const loginUser = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, isActive: true }).select(
    "+password"
  );

  if (!user)
    return next(new AppError(401, requestStatus.FAIL, "Invalid credentials"));

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch)
    return next(new AppError(401, requestStatus.FAIL, "Invalid credentials"));

  user.password = undefined;

  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  user.refreshToken = await hashPassword(refreshToken);
  await user.save();

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      code: 200,
      status: requestStatus.SUCCESS,
      message: "login successfully",
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
      },
      accessToken,
    });
});

export const refreshToken = asyncWrapper(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return next(new AppError(401, requestStatus.FAIL, "No refresh token"));

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || !(await comparePassword(token, user.refreshToken)))
    return next(new AppError(403, requestStatus.FAIL, "Invalid refresh token"));

  const newAccessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const newRefreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  user.refreshToken = await hashPassword(newRefreshToken);
  await user.save();
  res
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      code: 200,
      status: requestStatus.SUCCESS,
      message: "Tokens rotated successfully",
      accessToken: newAccessToken,
    });
});

export const logoutUser = asyncWrapper(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204);

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findOne({ _id: decoded.id, isActive: true });
  if (user && (await comparePassword(token, user.refreshToken))) {
    user.refreshToken = null;
    await user.save();
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
  });
  res.json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: "Logged out",
  });
});
