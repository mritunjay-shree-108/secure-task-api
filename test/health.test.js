const test = require("node:test");
const assert = require("node:assert");

const request = require("supertest");

const app = require("../app");

test("GET /health should return 200", async () => {
  const response = await request(app).get("/health");

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.status, "ok");
});
