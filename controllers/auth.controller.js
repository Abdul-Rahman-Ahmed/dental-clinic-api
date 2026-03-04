import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import AppError from "../utils/AppError.js";
import requestStatus from "../utils/requestStatus.js";

export const registerAdmin = asyncWrapper(async (req, res, next) => {
  const { username, password } = req.body;

  const exists = await Admin.findOne({ username });
  if (exists)
    return next(new AppError(400, requestStatus.FAIL, "Admin already exists"));
  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.create({
    username,
    password: hashedPassword,
  });

  res.status(201).json({
    code: 201,
    status: requestStatus.SUCCESS,
    message: "Admin created successfully",
  });
});

export const loginAdmin = asyncWrapper(async (req, res, next) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin)
    return next(new AppError(401, requestStatus.FAIL, "Invalid credentials"));

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch)
    return next(new AppError(401, requestStatus.FAIL, "Invalid credentials"));

  const accessToken = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: admin._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  admin.refreshToken = refreshToken;
  await admin.save();

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({
      code: 200,
      status: requestStatus.SUCCESS,
      message: "login successfully",
      accessToken,
    });
});

export const refreshToken = asyncWrapper(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return next(new AppError(401, requestStatus.FAIL, "No refresh token"));

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const admin = await Admin.findById(decoded.id);
  if (!admin || admin.refreshToken !== token)
    return next(new AppError(403, requestStatus.FAIL, "Invalid refresh token"));

  const newAccessToken = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const newRefreshToken = jwt.sign(
    { id: admin._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  admin.refreshToken = newRefreshToken;
  await admin.save();
  res
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
    })
    .json({
      code: 200,
      status: requestStatus.SUCCESS,
      message: "Tokens rotated successfully",
      accessToken: newAccessToken,
    });
});

export const logoutAdmin = asyncWrapper(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204);
  const admin = await Admin.findOne({ refreshToken: token });
  if (admin) {
    admin.refreshToken = null;
    await admin.save();
  }
  res.clearCookie("refreshToken");
  res.json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: "Logged out",
  });
});
