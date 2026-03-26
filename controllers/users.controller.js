import asyncWrapper from "../middlewares/asyncWrapper.middleware.js";
import requestStatus from "../utils/requestStatus.util.js";
import {
  createAdminService,
  createDoctorService,
  createPatientService,
  createReceptionistService,
  getAdminsService,
  getDoctorsService,
  getPatinetService,
  getReceptionistService,
  getUsersService,
} from "../services/user.service.js";
import { calculateAge } from "../utils/date.util.js";

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
        age: calculateAge(result.patient.age),
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
      admin: {
        user_id: result._id,
        name: result.name,
        email: result.email,
      },
    },
  });
});

export const getUsers = asyncWrapper(async (req, res) => {
  const users = await getUsersService();
  res.json(users);
});

export const getAdmins = asyncWrapper(async (req, res) => {
  const admins = await getAdminsService();
  res.json(admins);
});

export const getReceptionists = asyncWrapper(async (req, res) => {
  const receptionists = await getReceptionistService();
  res.json(receptionists);
});

export const getDoctors = asyncWrapper(async (req, res) => {
  const doctors = await getDoctorsService();
  res.json(doctors);
});

export const getPatients = asyncWrapper(async (req, res) => {
  const patinets = await getPatinetService();
  res.json(patinets);
});
