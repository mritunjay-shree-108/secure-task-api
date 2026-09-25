const mongoose = require("mongoose");
const Task = require("../models/Task");
const AppError = require("../util/AppError");
const asyncHandler = require("../util/asyncHandler");

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const createTask = asyncHandler(async (req, res) => {
  const { title, description, completed } = req.body;

  const task = await Task.create({
    title: title,
    description: description,
    completed: completed,
    userId: req.user.id,
  });

  return res.status(201).json({
    message: "Task added",
    task: {
      id: task._id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      userId: task.userId,
    },
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const { page, limit, sort, completed, search } = req.validatedQuery;

  const filter = { userId: req.user.id };

  if (completed !== undefined) {
    filter.completed = completed;
  }

  if (search) {
    const safeSearch = escapeRegex(search);

    filter.$or = [
      {
        title: {
          $regex: safeSearch,
          $options: "i",
        },
      },
      {
        description: {
          $regex: safeSearch,
          $options: "i",
        },
      },
    ];
  }

  const sortKey = sort === "latest" ? -1 : 1;

  const skip = (page - 1) * limit;

  const totalTasks = await Task.countDocuments(filter);

  const totalPages = Math.ceil(totalTasks / limit);

  const userTasks = await Task.find(filter)
    .populate("userId", "email role")
    .sort({ createdAt: sortKey })
    .skip(skip)
    .limit(limit);

  return res.json({
    page: page,
    limit: limit,
    totalTasks: totalTasks,
    totalPages: totalPages,
    tasks: userTasks,
  });
});

const getTask = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid Task ID", 400);
  }

  const requestedTask = await Task.findOne({
    _id: id,
    userId: req.user.id,
  }).populate("userId", "email role");

  if (!requestedTask) {
    throw new AppError("Task Doesn't Exist!", 404);
  }

  return res.json({
    task: requestedTask,
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid Task ID", 400);
  }

  const { title, description, completed } = req.body;

  const requestedTask = await Task.findOneAndUpdate(
    {
      _id: id,
      userId: req.user.id,
    },
    {
      title: title,
      description: description,
      completed: completed,
    },
    {
      returnDocument: "after",
    },
  );

  if (!requestedTask) {
    throw new AppError("Task doesn't exists!", 404);
  }

  return res.json({
    task: requestedTask,
  });
});

const patchTask = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid Task Id!", 400);
  }

  const { title, description, completed } = req.body;

  const updateData = {};

  if (title !== undefined) {
    updateData.title = title;
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  if (completed !== undefined) {
    updateData.completed = completed;
  }

  const requestedTask = await Task.findOneAndUpdate(
    {
      _id: id,
      userId: req.user.id,
    },
    {
      $set: updateData,
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!requestedTask) {
    throw new AppError("Task doesn't exist!", 404);
  }

  return res.json({
    task: requestedTask,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid Task Id!", 400);
  }

  const result = await Task.deleteOne({
    _id: id,
    userId: req.user.id,
  });

  if (result.deletedCount === 0) {
    throw new AppError("Task doesn't Exist!", 404);
  }

  return res.json({
    message: "Task Deleted Successfully!",
  });
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  patchTask,
  deleteTask,
};
