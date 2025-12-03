// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode || 500;
    this.details = details;
    this.isOperational = true; // mark as expected error
    Error.captureStackTrace(this, this.constructor);
  }

  // 🔹 Factory methods for common errors
  static duplicateKey(err) {
    const field = Object.keys(err.keyValue);
    const value = err.keyValue[field];
    return new AppError(`Duplicate ${field} entered: ${value}`, 400);
  }

  static invalidJwt() {
    return new AppError("Invalid JWT, please login again", 401);
  }

  static expiredJwt() {
    return new AppError("JWT expired, please login again", 401);
  }

  static castError(err) {
    return new AppError(`Invalid ${err.path}`, 400);
  }
}

export default AppError;
