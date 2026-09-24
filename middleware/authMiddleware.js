const jwt = require("jsonwebtoken");
const AppError = require("../util/AppError");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // if no/missing token or token isn't starting with Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid authorization header", 401));
  }
  // extracting the token
  const token = authHeader.slice(7).trim();

  if (!token) {
    return next(new AppError("Missing token", 401));
  }

  if (!process.env.JWT_SECRET) {
    return next(new AppError("JWT configuration error", 500));
  }
  // it can also generate error if invalid token format or expired token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token Expired", 401));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid Token", 401));
    }

    return next(new AppError("Authentication failed!", 401));
  }
};

module.exports = authMiddleware;
