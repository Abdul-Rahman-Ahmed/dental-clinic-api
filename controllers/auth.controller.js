import asyncWrapper from "../middlewares/asyncWrapper.middleware.js";
import requestStatus from "../utils/requestStatus.util.js";
import {
  loginUserService,
  logoutUseService,
  refreshTokenService,
  registerUserService,
} from "../services/auth.service.js";

export const registerUser = asyncWrapper(async (req, res) => {
  const results = await registerUserService(req.body);
  res.status(201).json({
    code: 201,
    status: requestStatus.SUCCESS,
    message: "User created successfully",
    user: {
      id: results._id,
      name: results.name,
      role: results.role,
    },
  });
});

export const loginUser = asyncWrapper(async (req, res) => {
  const results = await loginUserService(req.body);
  res
    .cookie("refreshToken", results.refreshToken, {
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
        id: results.user._id,
        role: results.user.role,
        name: results.user.name,
      },
      accessToken: results.accessToken,
    });
});

export const refreshToken = asyncWrapper(async (req, res, next) => {
  const results = await refreshTokenService(req.cookies.refreshToken);
  res
    .cookie("refreshToken", results.newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      code: 200,
      status: requestStatus.SUCCESS,
      message: "Tokens rotated successfully",
      accessToken: results.newAccessToken,
    });
});

export const logoutUser = asyncWrapper(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204);

  await logoutUseService(token);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: "Logged out",
  });
});
