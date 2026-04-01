import asyncWrapper from "../middlewares/asyncWrapper.middleware.js";
import requestStatus from "../utils/requestStatus.util.js";
import {
  createAdminService,
  createReceptionistService,
  statusService,
  getUsersByRoleService,
  getUsersService,
  modifyUserService,
} from "../services/user.service.js";
import AppError from "../utils/appError.util.js";

export const addAdmin = asyncWrapper(async (req, res) => {
  const result = await createAdminService(req.body);
  res.status(201).json({
    code: 201,
    status: requestStatus.SUCCESS,
    message: "Admin added successfully",
    data: {
      admin: {
        user_id: result._id,
        name: result.name,
        email: result.email,
      },
    },
  });
});

export const addReceptionist = asyncWrapper(async (req, res) => {
  const result = await createReceptionistService(req.body);
  res.status(201).json({
    code: 201,
    status: requestStatus.SUCCESS,
    message: "Receptionist added successfully",
    data: {
      receptionist: {
        user_id: result._id,
        name: result.name,
        email: result.email,
      },
    },
  });
});

export const getUsers = asyncWrapper(async (req, res) => {
  const currentRole = req.user.role;
  const { page = 1, limit = 10, role } = req.query;
  const users = role
    ? await getUsersByRoleService(role, page, limit, currentRole)
    : await getUsersService(page, limit, currentRole);

  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    results: users.length,
    data: {
      users,
    },
  });
});

export const status = asyncWrapper(async (req, res) => {
  const id = req.params.id;
  const status = req.body.isActive;
  if (typeof status !== "boolean")
    throw new AppError(400, requestStatus.FAIL, "isActive must to be Boolean");
  const result = await statusService(id, status);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: result
      ? `User ${status ? "activated" : "deactivated"} successfully`
      : `User already ${status ? "active" : "inactive"}`,
    data: {
      result,
    },
  });
});

export const modifiyUser = asyncWrapper(async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const currentRole = req.user.role;
  const result = await modifyUserService(id, data, currentRole);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: "updated user successfully",
    data: {
      result,
    },
  });
});
