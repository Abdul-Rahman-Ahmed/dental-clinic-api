import asyncWrapper from "../middlewares/asyncWrapper.middleware.js";
import requestStatus from "../utils/requestStatus.util.js";
import {
  createPatientService,
  getPatientsService,
  getPatientByIdService,
  updatePatientService,
} from "../services/patient.service.js";
import { calculateAge } from "../utils/date.util.js";
import AppError from "../utils/appError.util.js";

export const createPatient = asyncWrapper(async (req, res) => {
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

export const getPatients = asyncWrapper(async (req, res) => {
  const patients = await getPatientsService();
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    results: patients.length,
    data: { patients },
  });
});

export const getPatientById = asyncWrapper(async (req, res) => {
  const id = req.params.id;
  if (!id) throw new AppError(400, requestStatus.FAIL, "id is Required");
  const results = await getPatientByIdService(id);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    data: results,
  });
});

export const updatePatient = asyncWrapper(async (req, res) => {
  const data = req.body;
  const id = req.params.id;
  if (!id) throw new AppError(400, requestStatus.FAIL, "id is Required");

  const results = await updatePatientService(id, data);
  res
    .status(200)
    .json({ code: 200, status: requestStatus.SUCCESS, data: results });
});
