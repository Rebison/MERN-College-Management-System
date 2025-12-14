import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// -------------------------
// Daily rotating transport for general logs
// -------------------------
const rotateTransport = new DailyRotateFile({
    filename: "logs/%DATE%-app.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "50m",
    maxFiles: "30d",
    level: "info", // general logs
});

// -------------------------
// Daily rotating transport for error logs
// -------------------------
const errorTransport = new DailyRotateFile({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "50m",
    maxFiles: "60d",
    level: "error",
});

// -------------------------
// Winston Logger
// -------------------------
const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }), // include stack traces
        winston.format.splat(),
        winston.format.json() // structured JSON for easy parsing
    ),
    transports: [
        rotateTransport,
        errorTransport
    ]
});

// -------------------------
// Colorized console in development
// -------------------------
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    );
}

// -------------------------
// Helper: Log frontend errors with context
// -------------------------
export const logFrontendError = (message, context = {}) => {
    logger.error(message, context);
};

export default logger;