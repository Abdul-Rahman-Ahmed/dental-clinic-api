class AppError extends Error {
  constructor(codeStatus, errorStatus, message, errors = null) {
    super(message);
    this.codeStatus = codeStatus;
    this.errorStatus = errorStatus;
    this.errors = errors;
  }
}

export default AppError;
