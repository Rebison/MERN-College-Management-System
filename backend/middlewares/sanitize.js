import validator from "validator";

export const sanitizeInput = (req, res, next) => {
  if (req.body.email) req.body.email = validator.normalizeEmail(req.body.email);
  if (req.body.name) req.body.name = validator.escape(req.body.name.trim());
  next();
};
