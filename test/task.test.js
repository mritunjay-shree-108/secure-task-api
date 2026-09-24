require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const crypto = require("crypto");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../app");
const User = require("../models/User");
const Task = require("../models/Task");

let accessToken;
let testUser;
let taskId;

const testEmail = `task-test-${crypto.randomUUID()}@example.com`;
const password = "password123";

test.before(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI);

  const hashedPassword = await bcrypt.hash(password, 10);

  testUser = await User.create({
    email: testEmail,
    password: hashedPassword,
    role: "user",
  });

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: testEmail,
    password,
  });

  assert.strictEqual(loginResponse.statusCode, 200);

  accessToken = loginResponse.body.accessToken;
});

test.after(async () => {
  if (testUser) {
    await Task.deleteMany({ userId: testUser._id });
    await User.deleteOne({ _id: testUser._id });
  }

  await mongoose.disconnect();
});

// create task

test("POST /api/tasks should create a task", async () => {
  const response = await request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      title: "Learn automated testing",
      description: "Practice Supertest and Node test runner",
      completed: false,
    });

  assert.strictEqual(response.statusCode, 201);
  assert.strictEqual(response.body.message, "Task added");

  assert.ok(response.body.task);
  assert.ok(response.body.task.id);

  assert.strictEqual(response.body.task.title, "Learn automated testing");

  assert.strictEqual(response.body.task.completed, false);

  taskId = response.body.task.id;
});

// reject invalid task data

test("POST /api/tasks should reject invalid task data", async () => {
  const response = await request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      title: "",
      description: "",
    });

  assert.strictEqual(response.statusCode, 400);
  assert.strictEqual(response.body.success, false);
  assert.strictEqual(response.body.message, "Validation failed");

  assert.ok(Array.isArray(response.body.errors));
});

// get all tasks

test("GET /api/tasks should return user's tasks", async () => {
  const response = await request(app)
    .get("/api/tasks")
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(response.statusCode, 200);

  assert.ok(Array.isArray(response.body.tasks));
  assert.ok(response.body.totalTasks >= 1);
  assert.ok(response.body.totalPages >= 1);

  assert.strictEqual(response.body.tasks[0].userId.email, testEmail);
});

// get one task

test("GET /api/tasks/:id should return the task", async () => {
  const response = await request(app)
    .get(`/api/tasks/${taskId}`)
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(response.statusCode, 200);

  assert.strictEqual(response.body.task._id, taskId);

  assert.strictEqual(response.body.task.title, "Learn automated testing");
});

// invalid objectId
test("GET /api/tasks/:id should reject invalid ObjectId", async () => {
  const response = await request(app)
    .get("/api/tasks/not-a-valid-id")
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(response.statusCode, 400);
  assert.strictEqual(response.body.success, false);
  assert.strictEqual(response.body.message, "Invalid Task ID");
});

//patch task
test("PATCH /api/tasks/:id should partially update a task", async () => {
  const response = await request(app)
    .patch(`/api/tasks/${taskId}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      completed: true,
    });

  assert.strictEqual(response.statusCode, 200);

  assert.strictEqual(response.body.task.completed, true);

  assert.strictEqual(response.body.task.title, "Learn automated testing");
});

// put task

test("PUT /api/tasks/:id should update the task", async () => {
  const response = await request(app)
    .put(`/api/tasks/${taskId}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      title: "Updated testing task",
      description: "Updated description",
      completed: false,
    });

  assert.strictEqual(response.statusCode, 200);

  assert.strictEqual(response.body.task.title, "Updated testing task");

  assert.strictEqual(response.body.task.description, "Updated description");

  assert.strictEqual(response.body.task.completed, false);
});

// search
test("GET /api/tasks should search tasks", async () => {
  const response = await request(app)
    .get("/api/tasks")
    .query({
      search: "Updated testing",
    })
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(response.statusCode, 200);

  assert.ok(Array.isArray(response.body.tasks));
  assert.ok(response.body.tasks.length >= 1);

  assert.ok(
    response.body.tasks.some((task) => task.title === "Updated testing task"),
  );
});

// completed filter
test("GET /api/tasks should filter completed tasks", async () => {
  const response = await request(app)
    .get("/api/tasks")
    .query({
      completed: "false",
    })
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(response.statusCode, 200);

  assert.ok(response.body.tasks.every((task) => task.completed === false));
});

// pagination

test("GET /api/tasks should support pagination", async () => {
  const response = await request(app)
    .get("/api/tasks")
    .query({
      page: 1,
      limit: 5,
    })
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(response.statusCode, 200);

  assert.strictEqual(response.body.page, 1);
  assert.strictEqual(response.body.limit, 5);

  assert.ok(Array.isArray(response.body.tasks));
  assert.ok(response.body.tasks.length <= 5);
});

// delete task

test("DELETE /api/tasks/:id should delete the task", async () => {
  const response = await request(app)
    .delete(`/api/tasks/${taskId}`)
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.message, "Task Deleted Successfully!");
});

// confirm delelte task cannot be fetched

test("GET /api/tasks/:id should return 404 after deletion", async () => {
  const response = await request(app)
    .get(`/api/tasks/${taskId}`)
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(response.statusCode, 404);
  assert.strictEqual(response.body.success, false);
});
