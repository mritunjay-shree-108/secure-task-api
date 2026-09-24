const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.statusCode ? err.message : "Internal server error";

  if (err.code === 11000) {
    statusCode = 409;
    message = "Email already exists";
  }

  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body too large";
  }

  const response = {
    success: false,
    message: message,
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
