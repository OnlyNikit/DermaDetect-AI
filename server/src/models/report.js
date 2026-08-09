const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
    },
    title: { type: String, required: true }, // e.g. "Psoriasis Report"
    fileUrl: { type: String, default: null }, // set once the PDF is generated
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);