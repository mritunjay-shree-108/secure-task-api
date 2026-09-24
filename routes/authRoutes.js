const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { loginSchema, registerSchema } = require("../schemas/authSchema");
const validate = require("../middleware/validate");
const roleMiddleware = require("../middleware/roleMiddleware");
const authLimiter = require("../middleware/rateLimiter");

const {
  register,
  login,
  refresh,
  logout,
  profile,
  me,
  dashboard,
} = require("../controller/authController");

// register
router.post("/register", authLimiter, validate(registerSchema), register);

// login
router.post("/login", authLimiter, validate(loginSchema), login);

// refresh
router.post("/refresh", refresh);

// logout
router.post("/logout", logout);

router.get("/profile", auth, profile);

router.get("/me", auth, me);

router.get("/dashboard", auth, dashboard);

router.get("/admin/dashboard", auth, roleMiddleware("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin",
    user: req.user,
  });
});

module.exports = router;
