const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    icon: { type: String, default: "🔔" },
    unread: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);