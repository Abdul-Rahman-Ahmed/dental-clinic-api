import jwt from "jsonwebtoken";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, requestStatus.FAIL, "Not authorized"));
  }

  const token = authHeader.split(" ")[1];
  if (!token)
    return next(new AppError(401, requestStatus.FAIL, "Not authorized"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return next(new AppError(401, requestStatus.FAIL, "Not authorized"));
  }
};

export default protect;
