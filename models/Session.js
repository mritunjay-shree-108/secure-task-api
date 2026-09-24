const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    refreshTokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    familyId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

sessionSchema.index({ refreshTokenHash: 1 }, { unique: true });

sessionSchema.index({ familyId: 1 });

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
