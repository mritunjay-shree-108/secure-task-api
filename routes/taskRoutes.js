const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const validateQuery = require("../middleware/validateQuery");

const taskSchema = require("../schemas/taskSchema");
const taskQuerySchema = require("../schemas/taskQuerySchema");
const taskPatchSchema = require("../schemas/taskPatchSchema");

const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  patchTask,
  deleteTask,
} = require("../controller/taskController");

router.post("/", auth, validate(taskSchema), createTask);

router.get("/", auth, validateQuery(taskQuerySchema), getTasks);

router.get("/:id", auth, getTask);

router.put("/:id", auth, validate(taskSchema), updateTask);

router.patch("/:id", auth, validate(taskPatchSchema), patchTask);

router.delete("/:id", auth, deleteTask);

module.exports = router;
