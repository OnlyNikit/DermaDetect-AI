const mongoose = require("mongoose");
const crypto = require("crypto");

const phoneSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    status: {
      type: String,
      enum: ["waiting", "uploaded", "complete", "expired"],
      default: "waiting",
    },
    imageUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

phoneSessionSchema.index(
    {createdAt:-1},
    {expireAfterSeconds:600},
)

module.exports= mongoose.model("PhoneSession", phoneSessionSchema);
