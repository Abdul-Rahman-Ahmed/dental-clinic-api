import asyncWrapper from "../middlewares/asyncWrapper.middleware.js";
import requestStatus from "../utils/requestStatus.util.js";
import {
  createAdminService,
  createDoctorService,
  createPatientService,
  createReceptionistService,
  statusService,
  getDoctorsService,
  getPatientsService,
  getUsersByRoleService,
  getUsersService,
  modifyUserService,
  getPatientService,
  modifyPatientService,
} from "../services/user.service.js";
import { calculateAge } from "../utils/date.util.js";
import AppError from "../utils/appError.util.js";

export const addDoctor = asyncWrapper(async (req, res) => {
  const result = await createDoctorService(req.body, req.user);
  res.status(201).json({
    code: 201,
    status: requestStatus.SUCCESS,
    message: "Doctor added successfully",
    data: {
      doctor: {
        user_id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        specialization: result.doctor.specialization,
        workingHours: result.doctor.workingHours,
      },
    },
  });
});

export const addPatient = asyncWrapper(async (req, res) => {
  const result = await createPatientService(req.body, req.user);
  res.status(201).json({
    code: 201,
    status: requestStatus.SUCCESS,
    message: "Patient added successfully",
    data: {
      patient: {
        user_id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        gender: result.patient.gender,
        age: calculateAge(result.patient.dateOfBirth),
      },
    },
  });
});

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

export const getDoctors = asyncWrapper(async (req, res) => {
  const doctors = await getDoctorsService();
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    results: doctors.length,
    data: { doctors },
  });
});

export const getPatients = asyncWrapper(async (req, res) => {
  const patients = await getPatientsService();
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    results: patients.length,
    data: { patients },
  });
});

export const getPatient = asyncWrapper(async (req, res) => {
  const id = req.params.id;
  if (!id) throw new AppError(400, requestStatus.FAIL, "id is Required");
  const results = await getPatientService(id);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    data: results,
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

export const modifyPatient = asyncWrapper(async (req, res) => {
  const data = req.body;
  const id = req.params.id;
  if (!id) throw new AppError(400, requestStatus.FAIL, "id is Required");

  const results = await modifyPatientService(id, data);
  res
    .status(200)
    .json({ code: 200, status: requestStatus.SUCCESS, data: results });
});
