require("dotenv").config({ path: ".env" });

const test = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const crypto = require("crypto");
const request = require("supertest");

const app = require("../app");
const User = require("../models/User");

const testEmail = `test-${crypto.randomUUID()}@example.com`;

test.before(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI);
});

test.after(async () => {
  await User.deleteOne({ email: testEmail });
  await mongoose.disconnect();
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
