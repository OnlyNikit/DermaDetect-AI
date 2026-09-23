const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
    },

    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkinAssessment",
      default: null,
    },

    mode: {
      type: String,
      enum: ["video", "text"],
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },

    patientMessage: {
      type: String,
      default: "",
    },

    doctorNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);