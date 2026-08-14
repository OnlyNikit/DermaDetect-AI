const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const Assessment = require("../models/skinAssessment");

async function createAssessment(req, res) {
  try {
    // ==========================================
    // 1. Get data from frontend
    // ==========================================

    const { image, answers, optionalAnswers } = req.body;

    console.log("========== ASSESSMENT ==========");
    console.log("Image:", image);
    console.log("Answers:", answers);
    console.log("Optional Answers:", optionalAnswers);
    console.log("User:", req.user?._id);

    // ==========================================
    // 2. Validate
    // ==========================================

    if (!image || !answers) {
      return res.status(400).json({
        success: false,
        message: "image and answers are required",
      });
    }

    // ==========================================
    // 3. Get filename from image URL
    // ==========================================

    const filename = image.split("/uploads/")[1];

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Invalid image URL",
      });
    }

    // ==========================================
    // 4. Find image inside uploads folder
    // ==========================================

    const imagePath = path.join(__dirname, "../../uploads", filename);

    console.log("Image path:", imagePath);

    // ==========================================
    // 5. Check image exists
    // ==========================================

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: "Image file not found",
      });
    }

    // ==========================================
    // 6. Create assessment in MongoDB
    // ==========================================

    const assessment = await Assessment.create({
      // Logged-in user
      user: req.user?._id,

      image,

      location: answers.location,

      duration: answers.duration,

      itching: answers.itching,

      painBurning: answers.painBurning,

      changeSpread: answers.changeSpread,

      changeDetails: answers.changeDetails || [],

      worsensAroundPeriod: answers.worsensAroundPeriod || null,

      repeatsAroundPeriod: answers.repeatsAroundPeriod || null,

      optionalDetails: optionalAnswers || {},

      status: "pending",
    });

    console.log("Assessment created:", assessment._id);
    console.log("Image path:", imagePath);
    console.log("File exists:", fs.existsSync(imagePath));

    // ==========================================
    // 7. Prepare data for FastAPI
    // ==========================================

    const formData = new FormData();

    // Image
    formData.append("file", fs.createReadStream(imagePath));

    // Basic assessment data
    formData.append("location", answers.location);

    formData.append("duration", answers.duration);

    formData.append("itching", answers.itching);

    formData.append("painBurning", answers.painBurning);

    formData.append("changeSpread", answers.changeSpread);

    // Arrays / objects ko JSON string me bhejna
    formData.append(
      "changeDetails",
      JSON.stringify(answers.changeDetails || []),
    );

    formData.append("optionalDetails", JSON.stringify(optionalAnswers || {}));

    // ==========================================
    // 8. Send request to FastAPI
    // ==========================================

    console.log("Sending assessment to AI...");

    const aiResponse = await axios.post(
      "http://127.0.0.1:8000/predict",

      formData,

      {
        headers: {
          ...formData.getHeaders(),
        },

        maxContentLength: Infinity,

        maxBodyLength: Infinity,
      },
    );

    console.log("AI Response:", aiResponse.data);
    const aiResult = aiResponse.data;

    // ==========================================
    // 9. Get prediction
    // ==========================================

    const disease = aiResult?.prediction;
    const confidence = aiResult?.confidence;
    const severity  = aiResult?.severity;

    console.log("Disease:", disease);
    console.log("Confidence:", confidence);

    // ==========================================
    // 10. Save AI prediction
    // ==========================================

    if (!disease) {
      assessment.status = "failed";

      await assessment.save();

      return res.status(500).json({
        success: false,
        message: "AI did not return prediction",
      });
    }

    assessment.prediction = {
      disease: disease,
      confidence: confidence ?? 0,
      severity: severity,
    };

    // ==========================================
    // 11. Mark assessment as analyzed
    // ==========================================

    assessment.status = "analyzed";

    // ==========================================
    // 12. Save updated assessment
    // ==========================================

    await assessment.save();

    console.log("Assessment analyzed:", assessment._id);

    // ==========================================
    // 13. Send result to frontend
    // ==========================================

    return res.status(201).json({
      success: true,

      message: "Skin analysis completed successfully",

      assessmentId: assessment._id,

      prediction: assessment.prediction,
    });
  } catch (error) {
    console.error("========== ASSESSMENT ERROR ==========");

    console.error(error.response?.data || error.message);

    return res.status(500).json({
      success: false,

      message: "Skin analysis failed",

      error: error.message,
    });
  }
}

const mongoose = require("mongoose");

async function getAssessmentById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment ID",
      });
    }

    const assessment = await Assessment.findOne({
      _id: id,
      user: req.user._id,
    }).populate("user", "fullName age gender");

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    return res.status(200).json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error("Get assessment failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assessment",
      error: error.message,
    });
  }
}

// ============================================================
// ADD THIS FUNCTION into your existing contollers/assessment.controller.js
// (don't replace the whole file — just add this + export it)
// ============================================================

async function getHistory(req, res) {
  try {
    const history = await Assessment.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      history, // dashboard's mapAssessmentToResult() reads prediction/image/createdAt from each item
    });
  } catch (error) {
    console.error("Get history failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch scan history",
      error: error.message,
    });
  }
}

// then update your module.exports line to:
// module.exports = { createAssessment, getAssessmentById, getHistory };

module.exports = {
  createAssessment,
  getAssessmentById,
  getHistory,
};
