export const validate = (schema, source = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: error.details.map(e => ({
        field: e.path.join("."),
        issue: e.message
      })),
      requestId: req.requestId || null
    });
  }

  req[source] = value; // sanitized & stripped unknown fields
  next();
};
