import User from "../models/user.model.js";
import { checkUserExists } from "../utils/checkUser.util.js";
import { hashPassword } from "../utils/password.util.js";
import AppError from "../utils/appError.util.js";
import { comparePassword } from "../utils/password.util.js";
import { newToken, verifyToken } from "../utils/createToken.util.js";
import requestStatus from "../utils/requestStatus.util.js";

export const registerUserService = async (data) => {
  const { name, email, phone, password, role } = data;

  if (await checkUserExists(email))
    throw new AppError(400, requestStatus.FAIL, "User already exists");

  if (role === "super_admin")
    throw new AppError(403, requestStatus.FAIL, "Not allowed");

  const hashedPassword = await hashPassword(password, 10);

  return await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role,
  });
};

export const loginUserService = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ email, isActive: true }).select(
    "+password"
  );

  if (!user) throw new AppError(401, requestStatus.FAIL, "Invalid credentials");

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch)
    throw new AppError(401, requestStatus.FAIL, "Invalid credentials");

  const accessToken = newToken({ id: user._id, role: user.role }, true);
  const refreshToken = newToken({ id: user._id });

  user.refreshToken = await hashPassword(refreshToken);
  await user.save();
  user.password = undefined;

  return {
    refreshToken,
    user,
    accessToken,
  };
};

export const refreshTokenService = async (refreshToken) => {
  const token = refreshToken;
  if (!token) throw new AppError(401, requestStatus.FAIL, "No refresh token");

  const decoded = verifyToken(token);
  const user = await User.findOne(
    {
      _id: decoded.id,
      isActive: true,
    },
    "+refreshToken"
  );
  if (
    !user ||
    !user.refreshToken ||
    !(await comparePassword(token, user.refreshToken))
  )
    throw new AppError(403, requestStatus.FAIL, "Invalid refresh token");

  const newAccessToken = newToken({ id: user._id, role: user.role }, true);
  const newRefreshToken = newToken({ id: user._id });

  user.refreshToken = await hashPassword(newRefreshToken);
  await user.save();
  return {
    newRefreshToken,
    newAccessToken,
  };
};

export const logoutUseService = async (refreshToken) => {
  const token = refreshToken;
  if (!token) return res.sendStatus(204);

  const decoded = verifyToken(token);
  const user = await User.findOne(
    { _id: decoded.id, isActive: true },
    "+refreshToken"
  );

  if (user && (await comparePassword(token, user.refreshToken))) {
    user.refreshToken = null;
    await user.save();
  }
};
