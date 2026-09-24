const test = require("node:test");
const assert = require("node:assert");

const request = require("supertest");

const app = require("../app");

test("GET /unknown-route should return 404", async () => {
  const response = await request(app).get("/unknown-route");

  assert.strictEqual(response.statusCode, 404);
  assert.strictEqual(response.body.success, false);
  assert.strictEqual(response.body.message, "Route not found");
});
