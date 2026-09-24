const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/authRoutes");

const corsOptions = require("./middleware/corsOption");
const logger = require("./middleware/logger");
const routeNotFound = require("./middleware/routeNotFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());

app.use(express.json({ limit: "10kb" }));

app.use(cors(corsOptions));

app.use(logger);

app.get("/health", (req, res) => {
  return res.json({
    status: "ok",
  });
});

app.use("/api/auth", userRoutes);
app.use("/api/tasks", taskRoutes);

app.use(routeNotFound);
app.use(errorHandler);

module.exports = app;
