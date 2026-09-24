const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (requiredRole === req.user.role) {
      return next();
    }
    return res.status(403).json({
      message: "Access Denied",
    });
  };
};

module.exports = roleMiddleware;
