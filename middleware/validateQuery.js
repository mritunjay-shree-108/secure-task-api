const AppError = require("../util/AppError");

const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(new AppError("Validation failed", 400, errors));
    }

    req.validatedQuery = result.data;
    return next();
  };
};

module.exports = validateQuery;
