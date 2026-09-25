require("dotenv").config({ path: ".env" });

const test = require("node:test");
const assert = require("node:assert");
const crypto = require("crypto");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const { loginAsTestUser } = require("./helpers/auth");
const { connectTestDB, disconnectTestDB } = require("./helpers/db");
const Session = require("../models/Session");
const app = require("../app");
const User = require("../models/User");

const testEmail = `test-${crypto.randomUUID()}@example.com`;

test.before(async () => {
  await connectTestDB();
});

test.after(async () => {
  const user = await User.findOne({ email: testEmail });

  if (user) {
    await Session.deleteMany({ userId: user._id });
  }

  await User.deleteOne({ email: testEmail });

  await disconnectTestDB();
});

test("POST /api/auth/register should reject invalid data", async () => {
  const response = await request(app).post("/api/auth/register").send({
    email: "not-an-email",
    password: "123",
  });

  assert.strictEqual(response.statusCode, 400);
  assert.strictEqual(response.body.success, false);
  assert.strictEqual(response.body.message, "Validation failed");
  assert.ok(Array.isArray(response.body.errors));
});

test("POST /api/auth/register should successfully register a user", async () => {
  const password = "password123";

  const response = await request(app).post("/api/auth/register").send({
    email: testEmail,
    password,
  });

  assert.strictEqual(response.statusCode, 201);
  assert.strictEqual(response.body.message, "User Registered Successfully!");

  assert.strictEqual(response.body.user.email, testEmail);
  assert.strictEqual(response.body.user.role, "user");

  const user = await User.findOne({ email: testEmail });

  assert.ok(user);
  assert.notStrictEqual(user.password, password);
});

test("POST /api/auth/register should reject duplicate email", async () => {
  const response = await request(app).post("/api/auth/register").send({
    email: testEmail,
    password: "password123",
  });

  assert.strictEqual(response.statusCode, 409);
  assert.strictEqual(response.body.message, "This User is already Registered!");
  assert.strictEqual(response.body.success, false);
});

test("GET /api/auth/profile should allow authenticated user", async () => {
  const { accessToken } = await loginAsTestUser(testEmail, "password123");

  const response = await request(app)
    .get("/api/auth/profile")
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.message, "Authenticated Successfully!");

  assert.strictEqual(response.body.user.email, testEmail);
  assert.strictEqual(response.body.user.role, "user");
});

test("POST /api/auth/login should login successfully", async () => {
  const response = await request(app).post("/api/auth/login").send({
    email: testEmail,
    password: "password123",
  });

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.message, "Login Successful");

  assert.ok(response.body.accessToken);
  assert.ok(response.body.refreshToken);
});

test("POST /api/auth/login should reject wrong password", async () => {
  const response = await request(app).post("/api/auth/login").send({
    email: testEmail,
    password: "wrongpassword",
  });

  assert.strictEqual(response.statusCode, 401);
  assert.strictEqual(response.body.message, "Invalid Email / Password");
  assert.strictEqual(response.body.success, false);
});

test("POST /api/auth/login should reject unknown email", async () => {
  const response = await request(app).post("/api/auth/login").send({
    email: "doesnotexist@example.com",
    password: "password123",
  });

  assert.strictEqual(response.statusCode, 401);
  assert.strictEqual(response.body.message, "Invalid Email / Password");
  assert.strictEqual(response.body.success, false);
});

test("GET /api/auth/profile should allow authenticated user", async () => {
  const loginResponse = await request(app).post("/api/auth/login").send({
    email: testEmail,
    password: "password123",
  });

  assert.strictEqual(loginResponse.statusCode, 200);

  const accessToken = loginResponse.body.accessToken;

  const response = await request(app)
    .get("/api/auth/profile")
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.message, "Authenticated Successfully!");

  assert.strictEqual(response.body.user.email, testEmail);
  assert.strictEqual(response.body.user.role, "user");
});

test("GET /api/auth/profile should reject missing token", async () => {
  const response = await request(app).get("/api/auth/profile");

  assert.strictEqual(response.statusCode, 401);
  assert.strictEqual(
    response.body.message,
    "Missing or invalid authorization header",
  );
  assert.strictEqual(response.body.success, false);
});

test("GET /api/auth/profile should reject malformed authorization header", async () => {
  const response = await request(app)
    .get("/api/auth/profile")
    .set("Authorization", "Basic abc123");

  assert.strictEqual(response.statusCode, 401);
  assert.strictEqual(
    response.body.message,
    "Missing or invalid authorization header",
  );
  assert.strictEqual(response.body.success, false);
});

test("GET /api/auth/profile should reject invalid JWT", async () => {
  const response = await request(app)
    .get("/api/auth/profile")
    .set("Authorization", "Bearer invalid.token.here");

  assert.strictEqual(response.statusCode, 401);
  assert.strictEqual(response.body.message, "Invalid Token");
  assert.strictEqual(response.body.success, false);
});

test("GET /api/auth/profile should reject invalid JWT", async () => {
  const response = await request(app)
    .get("/api/auth/profile")
    .set("Authorization", "Bearer invalid.token.here");

  assert.strictEqual(response.statusCode, 401);
  assert.strictEqual(response.body.message, "Invalid Token");
  assert.strictEqual(response.body.success, false);
});

test("POST /api/auth/refresh should reject missing refresh token", async () => {
  const response = await request(app).post("/api/auth/refresh").send({});

  assert.strictEqual(response.statusCode, 401);
  assert.strictEqual(response.body.message, "Refresh Token is required");
  assert.strictEqual(response.body.success, false);
});

test("POST /api/auth/refresh should reject invalid refresh token", async () => {
  const response = await request(app).post("/api/auth/refresh").send({
    refreshToken: "this-is-not-a-valid-refresh-token",
  });

  assert.strictEqual(response.statusCode, 401);
  assert.strictEqual(response.body.message, "Invalid refresh Token");
  assert.strictEqual(response.body.success, false);
});

test("POST /api/auth/refresh should rotate refresh token", async () => {
  const loginResponse = await request(app).post("/api/auth/login").send({
    email: testEmail,
    password: "password123",
  });

  assert.strictEqual(loginResponse.statusCode, 200);

  const oldRefreshToken = loginResponse.body.refreshToken;

  const response = await request(app).post("/api/auth/refresh").send({
    refreshToken: oldRefreshToken,
  });

  assert.strictEqual(response.statusCode, 200);

  assert.ok(response.body.accessToken);
  assert.ok(response.body.refreshToken);

  assert.notStrictEqual(response.body.refreshToken, oldRefreshToken);
});

test("POST /api/auth/refresh should detect refresh token reuse", async () => {
  const loginResponse = await request(app).post("/api/auth/login").send({
    email: testEmail,
    password: "password123",
  });

  assert.strictEqual(loginResponse.statusCode, 200);

  const refreshTokenA = loginResponse.body.refreshToken;

  const firstRefresh = await request(app).post("/api/auth/refresh").send({
    refreshToken: refreshTokenA,
  });

  assert.strictEqual(firstRefresh.statusCode, 200);

  const refreshTokenB = firstRefresh.body.refreshToken;

  // Reuse old token A
  const reuseResponse = await request(app).post("/api/auth/refresh").send({
    refreshToken: refreshTokenA,
  });

  assert.strictEqual(reuseResponse.statusCode, 401);
  assert.strictEqual(
    reuseResponse.body.message,
    "Refresh Token reuse detected",
  );

  // Token B belongs to the same family and should now be revoked
  const familyResponse = await request(app).post("/api/auth/refresh").send({
    refreshToken: refreshTokenB,
  });

  assert.strictEqual(familyResponse.statusCode, 401);
});

test("POST /api/auth/logout should revoke refresh token", async () => {
  const loginResponse = await request(app).post("/api/auth/login").send({
    email: testEmail,
    password: "password123",
  });

  assert.strictEqual(loginResponse.statusCode, 200);

  const refreshToken = loginResponse.body.refreshToken;

  const logoutResponse = await request(app).post("/api/auth/logout").send({
    refreshToken,
  });

  assert.strictEqual(logoutResponse.statusCode, 200);
  assert.strictEqual(logoutResponse.body.message, "Session Logged Out");

  // The revoked token should no longer be usable
  const refreshResponse = await request(app).post("/api/auth/refresh").send({
    refreshToken,
  });

  assert.strictEqual(refreshResponse.statusCode, 401);
});

test("GET /api/auth/admin/dashboard should reject normal user", async () => {
  const loginResponse = await request(app).post("/api/auth/login").send({
    email: testEmail,
    password: "password123",
  });

  assert.strictEqual(loginResponse.statusCode, 200);

  const accessToken = loginResponse.body.accessToken;

  const response = await request(app)
    .get("/api/auth/admin/dashboard")
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(response.statusCode, 403);
  assert.strictEqual(response.body.message, "Access Denied");
});

test("GET /api/auth/admin/dashboard should allow admin", async () => {
  const user = await User.findOneAndUpdate(
    { email: testEmail },
    { role: "admin" },
    { returnDocument: "after" },
  );

  assert.ok(user);
  assert.strictEqual(user.role, "admin");

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: testEmail,
    password: "password123",
  });

  assert.strictEqual(loginResponse.statusCode, 200);

  const accessToken = loginResponse.body.accessToken;

  const response = await request(app)
    .get("/api/auth/admin/dashboard")
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.message, "Welcome Admin");
});
