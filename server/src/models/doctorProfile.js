const mongoose = require("mongoose");

const DoctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    qualification: {
      type: String,
      required: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    experience: {
      type: Number,
      required: true,
      min: 0,
    },

    hospital: {
      type: String,
      trim: true,
      default: "",
    },

    clinic: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    languages: {
      type: [String],
      default: [],
    },

    consultationModes: {
      type: [String],
      enum: ["video", "text"],
      default: ["text"],
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    isAvailable: {
      type: Boolean,
      default: false,
    },

    availability: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },

        startTime: String,
        endTime: String,
        enabled: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DoctorProfile", DoctorProfileSchema);