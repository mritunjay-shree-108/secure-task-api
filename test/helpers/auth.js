const request = require("supertest");
const app = require("../../app");

const loginAsTestUser = async (email, password) => {
  const response = await request(app).post("/api/auth/login").send({
    email,
    password,
  });

  return response.body;
};

module.exports = {
  loginAsTestUser,
};
