const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes window
  limit: 5, // Limit each IP to 5 requests per window
  message: "Too many requests from this IP, please try again later.",
});

module.exports = limiter;
