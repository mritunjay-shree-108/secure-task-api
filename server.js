require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");

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

app.use("/api/auth", userRoutes);
app.use("/api/tasks", taskRoutes);

app.use(routeNotFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(`Database connection failed : ${error.message}`);
    process.exit(1);
  }
};

startServer();
