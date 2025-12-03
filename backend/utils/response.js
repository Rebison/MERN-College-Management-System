export const sendResponse = (res, statusCode, success, message, data = null, meta = {}) => {
  res.status(statusCode).json({
    success,
    message,
    ...(data && { data }),
    meta: {
      requestId: meta.requestId || null,
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
};
