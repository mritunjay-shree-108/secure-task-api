const mongoose = require("mongoose");

const connectTestDB = async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI);
};

const disconnectTestDB = async () => {
  await mongoose.disconnect();
};

module.exports = {
  connectTestDB,
  disconnectTestDB,
};
