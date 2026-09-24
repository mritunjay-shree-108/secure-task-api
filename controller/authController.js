const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Session = require("../models/Session");

const AppError = require("../util/AppError");
const asyncHandler = require("../util/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const foundUser = await User.findOne({ email });
  if (foundUser) {
    throw new AppError("This User is already Registered!", 409);
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
    role: "user",
  });

  return res.status(201).json({
    message: "User Registered Successfully!",
    user: {
      id: user._id,
      email: email,
      role: "user",
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const foundUser = await User.findOne({ email });

  if (!foundUser) {
    throw new AppError("Invalid Email / Password", 401);
  }

  const isMatch = await bcrypt.compare(password, foundUser.password);

  if (!isMatch) {
    throw new AppError("Invalid Email / Password", 401);
  }

  const accessToken = jwt.sign(
    { id: foundUser._id, email: foundUser.email, role: foundUser.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = crypto.randomBytes(32).toString("hex");

  const familyId = crypto.randomBytes(16).toString("hex");

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Session.create({
    userId: foundUser._id,
    refreshTokenHash: refreshTokenHash,
    expiresAt: expiresAt,
    familyId: familyId,
  });

  return res.json({
    message: "Login Successful",
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh Token is required", 401);
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await Session.findOneAndUpdate(
    {
      refreshTokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );

  if (!session) {
    const existingSession = await Session.findOne({
      refreshTokenHash,
    });

    if (!existingSession) {
      throw new AppError("Invalid refresh Token", 401);
    }

    if (existingSession.revokedAt) {
      await Session.updateMany(
        {
          familyId: existingSession.familyId,
          revokedAt: null,
        },
        {
          $set: {
            revokedAt: new Date(),
          },
        },
      );
      throw new AppError("Refresh Token reuse detected", 401);
    }

    if (existingSession.expiresAt <= new Date()) {
      throw new AppError("Refresh Token Expired", 401);
    }

    throw new AppError("Invalid refresh Token", 401);
  }

  const user = await User.findById(session.userId);

  if (!user) {
    throw new AppError("User not Found", 401);
  }

  const newRefreshToken = crypto.randomBytes(32).toString("hex");

  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  await Session.create({
    userId: user._id,
    refreshTokenHash: newRefreshTokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    familyId: session.familyId,
  });

  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  return res.json({
    accessToken: accessToken,
    refreshToken: newRefreshToken,
  });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh Token is required", 401);
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await Session.findOne({
    refreshTokenHash: refreshTokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!session || session.expiresAt <= new Date()) {
    throw new AppError("Missing / Invalid / Expired Session", 401);
  }

  await Session.updateOne(
    {
      refreshTokenHash,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );

  return res.status(200).json({
    message: "Session Logged Out",
  });
});

const profile = asyncHandler(async (req, res) => {
  res.json({
    message: "Authenticated Successfully!",
    user: req.user,
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    user: req.user,
  });
});

const dashboard = asyncHandler(async (req, res) => {
  res.json({
    message: "Welcome to your dashboard",
    userId: req.user.id,
    email: req.user.email,
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  profile,
  me,
  dashboard,
};
