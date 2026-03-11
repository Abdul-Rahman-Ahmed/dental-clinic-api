export const authorized = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, requestStatus.FAIL, "Not authorized"));
    }

    next();
  };
};
