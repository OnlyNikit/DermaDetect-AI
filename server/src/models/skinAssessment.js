// const mongoose = require("mongoose");

// const assessmentSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: false, // agar auth optional hai to false rakho, warna true kar do
//     },

//     image: {
//       type: String, // Cloudinary/S3 URL ya uploaded file ka path
//       required: true,
//     },

//     location: {
//       type: String,
//       enum: [
//         "Face",
//         "Scalp",
//         "Neck",
//         "Chest / Back",
//         "Hand / Arm",
//         "Leg / Foot",
//         "Other",
//       ],
//       required: true,
//     },

//     duration: {
//       type: String,
//       enum: [
//         "Less than 1 week",
//         "1–4 weeks",
//         "1–6 months",
//         "More than 6 months",
//         "Not sure",
//       ],
//       required: true,
//     },

//     itching: {
//       type: String,
//       enum: ["Yes", "No"],
//       required: true,
//     },

//     painBurning: {
//       type: String,
//       enum: ["Yes", "No", "Not sure"],
//       required: true,
//     },

//     changeSpread: {
//       type: String,
//       enum: ["Yes", "No"],
//       required: true,
//     },

//     changeDetails: {
//       type: [String],
//       enum: [
//         "It became larger",
//         "It changed color",
//         "It spread to another area",
//         "It changed in appearance",
//       ],
//       default: [],
//     },
//     worsensAroundPeriod: {
//       type: String,
//       enum: ["Yes", "No", "Not sure"],
//       default: null,
//     },
//     repeatsAroundPeriod: {
//       type: String,
//       enum: ["Yes", "No", "Not sure"],
//       default: null,
//     },

//     optionalDetails: {
//       dryFlaky: { type: String, enum: ["Yes", "No"], default: null },
//       ringShaped: { type: String, enum: ["Yes", "No"], default: null },
//       raised: { type: String, enum: ["Yes", "No"], default: null },
//       fluidPus: { type: String, enum: ["Yes", "No"], default: null },
//       bleeding: { type: String, enum: ["Yes", "No"], default: null },
//     },
//     prediction: {
//       disease: {
//         type: String,
//         default: null,
//       },

//       confidence: {
//         type: Number,
//         default: null,
//       },

//       severity: {
//         type: String,
//         default: null,
//       },
//     },

//     status: {
//       type: String,
//       enum: ["pending", "analyzed", "failed"],
//       default: "pending",
//     },
//   },
//   { timestamps: true },
// );

// const Assessment = mongoose.model("Assessment", assessmentSchema);
// module.exports = Assessment;


// -------------------------------------------------------
const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    image: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      enum: [
        "Face",
        "Scalp",
        "Neck",
        "Chest / Back",
        "Hand / Arm",
        "Leg / Foot",
        "Other",
      ],
      required: true,
    },

    duration: {
      type: String,
      enum: [
        "Less than 1 week",
        "1–4 weeks",
        "1–6 months",
        "More than 6 months",
        "Not sure",
      ],
      required: true,
    },

    itching: { type: String, enum: ["Yes", "No"], required: true },
    painBurning: { type: String, enum: ["Yes", "No", "Not sure"], required: true },
    changeSpread: { type: String, enum: ["Yes", "No"], required: true },

    changeDetails: {
      type: [String],
      enum: [
        "It became larger",
        "It changed color",
        "It spread to another area",
        "It changed in appearance",
      ],
      default: [],
    },
    worsensAroundPeriod: { type: String, enum: ["Yes", "No", "Not sure"], default: null },
    repeatsAroundPeriod: { type: String, enum: ["Yes", "No", "Not sure"], default: null },

    optionalDetails: {
      dryFlaky: { type: String, enum: ["Yes", "No"], default: null },
      ringShaped: { type: String, enum: ["Yes", "No"], default: null },
      raised: { type: String, enum: ["Yes", "No"], default: null },
      fluidPus: { type: String, enum: ["Yes", "No"], default: null },
      bleeding: { type: String, enum: ["Yes", "No"], default: null },
    },

    prediction: {
      disease: { type: String, default: null },
      confidence: { type: Number, default: null },
      severity: { type: String, default: null },
      // NEW fields - dashboard's ResultView reads these directly
      description: { type: String, default: null },
      contagious: { type: String, default: null },
      recommendation: { type: String, default: null },
    },

    // NEW - top-level overrides the dashboard also checks for
    explanation: { type: String, default: null },
    recommendation: { type: String, default: null },

    status: {
      type: String,
      enum: ["pending", "analyzed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Assessment = mongoose.model("Assessment", assessmentSchema);
module.exports = Assessment;