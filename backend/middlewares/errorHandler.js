// middlewares/errorHandler.js
import logger from "#utils/logger.js";
import AppError from "#utils/AppError.js";
import { Log } from "#models/index.js";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

/**
 * Mask sensitive data like passwords, tokens, etc.
 */
const sanitizeBody = (body) => {
  if (!body) return {};
  const clone = { ...body };
  if (clone.password) clone.password = "***";
  if (clone.token) clone.token = "***";
  return clone;
};

/**
 * Express Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // 🔹 Map known errors into AppError
  if (err.code === 11000) err = AppError.duplicateKey(err);
  if (err.name === "JsonWebTokenError") err = AppError.invalidJwt();
  if (err.name === "TokenExpiredError") err = AppError.expiredJwt();
  if (err.name === "CastError") err = AppError.castError(err);

  const timestamp = new Date().toISOString();
  const clientIp =
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "Unknown IP";

  const context = {
    stack: err.stack,
    requestId: req.requestId || null,
    route: req.originalUrl || req.url,
    method: req.method,
    userId: req.user?.id || null,
    userType: req.user?.userType || null,
    ip: clientIp,
    timestamp,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? "***" : undefined,
    },
    query: req.query,
    body: sanitizeBody(req.body),
    extra: err.extra || {},
  };

  // 🔹 Log error (Winston)
  logger.error(err.message || "Internal Server Error", context);

  // 🔹 Persist in DB (non-blocking, fire & forget)
  Log.create({
    level: "error",
    message: err.message || "Internal Server Error",
    stack: err.stack,
    requestId: req.requestId || null,
    route: req.originalUrl || req.url,
    method: req.method,
    userId: req.user?.id || null,
    meta: context,
  }).catch((dbErr) => {
    logger.error("Failed to save error log to DB", {
      message: dbErr.message,
      stack: dbErr.stack,
    });
  });

  // 🔹 Controlled operational errors
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.code || "APP_ERROR",
      details:
        process.env.NODE_ENV === "development" ? err.details : null,
      requestId: req.requestId || null,
    });
  }

  // 🔹 Unexpected errors
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err.message || "Internal Server Error"
        : "Internal Server Error",
    errorCode: "UNEXPECTED_ERROR",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    requestId: req.requestId || null,
  });
};
