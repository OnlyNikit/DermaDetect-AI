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
      enum: ["video", "text", "in-person"],
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
      default: "verified",
    },

    isAvailable: {
      type: Boolean,
      default: false,
    },

    // -------------------------------------------------
    // NEW: date-wise availability.
    // Each entry is one time frame on one specific date.
    // A doctor can have multiple entries for the same
    // date (e.g. a morning slot and an evening slot).
    // -------------------------------------------------
    availabilitySlots: [
      {
        date: {
          type: String, // "YYYY-MM-DD"
          required: true,
        },

        startTime: {
          type: String, // "HH:MM" (24-hour)
          required: true,
        },

        endTime: {
          type: String, // "HH:MM" (24-hour)
          required: true,
        },
      },
    ],

    // Kept for backward compatibility with any existing
    // data / UI still reading the old weekly schedule.
    // Not used by the new date-wise booking flow.
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

        startTime: {
          type: String,
        },

        endTime: {
          type: String,
        },

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