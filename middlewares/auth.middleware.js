import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import { verifyToken } from "../utils/createToken.util.js";

export default protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, requestStatus.FAIL, "Not authorized"));
  }

  const token = authHeader.split(" ")[1];
  if (!token)
    return next(new AppError(401, requestStatus.FAIL, "Not authorized"));

  try {
    verifyToken(token, true);
    const decoded = verifyToken(token, true);
    req.user = decoded;
    next();
  } catch {
    return next(new AppError(401, requestStatus.FAIL, "Not authorized"));
  }
};
