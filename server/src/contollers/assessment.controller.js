const axios = require("axios");

const Assessment = require("../models/skinAssessment");
const mongoose = require("mongoose");

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
        message: "Image and answers are required",
      });
    }

    // ==========================================
    // 3. Create assessment in MongoDB
    // ==========================================

    const assessment = await Assessment.create({
      user: req.user?._id,

      // Cloudinary URL directly save
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

    // ==========================================
    // 4. Send Cloudinary image URL to AI service
    // ==========================================

    console.log("Sending assessment to AI...");
    console.log("AI Service URL:", process.env.AI_SERVICE_URL);
    console.log("Calling:", `${process.env.AI_SERVICE_URL}/predict`);

    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/predict`,

      {
        imageUrl: image,
      },

      {
        timeout: 60000,
      },
    );

    console.log("AI Response:", aiResponse.data);

    const aiResult = aiResponse.data;

    // ==========================================
    // 5. Get prediction
    // ==========================================

    const disease = aiResult?.prediction;
    const confidence = aiResult?.confidence;
    const severity = aiResult?.severity;

    console.log("Disease:", disease);
    console.log("Confidence:", confidence);
    console.log("Severity:", severity);

    // ==========================================
    // 6. Validate AI response
    // ==========================================

    if (!disease) {
      assessment.status = "failed";

      await assessment.save();

      return res.status(500).json({
        success: false,
        message: "AI did not return prediction",
      });
    }

    // ==========================================
    // 7. Save AI prediction
    // ==========================================

    assessment.prediction = {
      disease,
      confidence: confidence ?? 0,
      severity,
    };

    assessment.status = "analyzed";

    await assessment.save();

    console.log("Assessment analyzed:", assessment._id);

    // ==========================================
    // 8. Send result to frontend
    // ==========================================

    return res.status(201).json({
      success: true,

      message: "Skin analysis completed successfully",

      assessmentId: assessment._id,

      prediction: assessment.prediction,
    });
  } catch (error) {
    console.error("========== ASSESSMENT ERROR ==========");

    console.error("Message:", error.message);
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);

    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Skin analysis failed",
      error:
        typeof error.response?.data === "object"
          ? error.response.data
          : error.message,
    });
  }
}

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

async function getHistory(req, res) {
  try {
    const history = await Assessment.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      history,
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

module.exports = {
  createAssessment,
  getAssessmentById,
  getHistory,
};
