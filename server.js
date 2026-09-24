require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
