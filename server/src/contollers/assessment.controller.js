const axios = require("axios");
const mongoose = require("mongoose");

const Assessment = require("../models/skinAssessment");

// =====================================================
// GET LATEST ASSESSMENT
// GET /api/assessment/latest
// =====================================================

async function getLatestAssessment(req, res) {
  try {
    const assessment =
      await Assessment.findOne({
        user: req.user._id,
        status: "analyzed",
      }).sort({
        createdAt: -1,
      });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message:
          "No analyzed assessment found",
      });
    }

    return res.status(200).json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error(
      "GET LATEST ASSESSMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch latest assessment",
    });
  }
}

// =====================================================
// CREATE ASSESSMENT
// POST /api/assessment
// =====================================================

async function createAssessment(
  req,
  res
) {
  try {
    const {
      image,
      answers,
      optionalAnswers,
    } = req.body;

    console.log(
      "========== ASSESSMENT =========="
    );

    console.log(
      "Image:",
      image
    );

    console.log(
      "Answers:",
      answers
    );

    console.log(
      "Optional Answers:",
      optionalAnswers
    );

    console.log(
      "User:",
      req.user?._id
    );

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!image || !answers) {
      return res.status(400).json({
        success: false,
        message:
          "Image and answers are required",
      });
    }

    // ==========================================
    // CREATE ASSESSMENT
    // ==========================================

    const assessment =
      await Assessment.create({
        user: req.user._id,

        image,

        location:
          answers.location,

        duration:
          answers.duration,

        itching:
          answers.itching,

        painBurning:
          answers.painBurning,

        changeSpread:
          answers.changeSpread,

        changeDetails:
          answers.changeDetails || [],

        worsensAroundPeriod:
          answers.worsensAroundPeriod ||
          null,

        repeatsAroundPeriod:
          answers.repeatsAroundPeriod ||
          null,

        optionalDetails:
          optionalAnswers || {},

        status: "pending",
      });

    console.log(
      "Assessment created:",
      assessment._id
    );

    // ==========================================
    // AI SERVICE
    // ==========================================

    if (
      !process.env.AI_SERVICE_URL
    ) {
      assessment.status =
        "failed";

      await assessment.save();

      return res.status(500).json({
        success: false,
        message:
          "AI service URL is not configured",
      });
    }

    console.log(
      "AI Service:",
      process.env.AI_SERVICE_URL
    );

    const aiResponse =
      await axios.post(
        `${process.env.AI_SERVICE_URL}/predict`,
        {
          imageUrl: image,
        },
        {
          timeout: 60000,
        }
      );

    console.log(
      "AI Response:",
      aiResponse.data
    );

    // ==========================================
    // AI RESULT
    // ==========================================

    const aiResult =
      aiResponse.data;

    const prediction =
      aiResult?.prediction;

    let disease;
    let confidence;
    let severity;

    // Supports:
    // prediction as object
    // OR prediction as string

    if (
      prediction &&
      typeof prediction ===
        "object"
    ) {
      disease =
        prediction.disease;

      confidence =
        prediction.confidence;

      severity =
        prediction.severity;
    } else {
      disease =
        prediction;

      confidence =
        aiResult?.confidence;

      severity =
        aiResult?.severity;
    }

    console.log(
      "Disease:",
      disease
    );

    console.log(
      "Confidence:",
      confidence
    );

    console.log(
      "Severity:",
      severity
    );

    // ==========================================
    // VALIDATE AI
    // ==========================================

    if (!disease) {
      assessment.status =
        "failed";

      await assessment.save();

      return res.status(500).json({
        success: false,
        message:
          "AI did not return prediction",
      });
    }

    // ==========================================
    // SAVE RESULT
    // ==========================================

    assessment.prediction = {
      disease,

      confidence:
        confidence ?? 0,

      severity:
        severity || "Unknown",
    };

    assessment.status =
      "analyzed";

    await assessment.save();

    console.log(
      "Assessment analyzed:",
      assessment._id
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,

      message:
        "Skin analysis completed successfully",

      assessmentId:
        assessment._id,

      assessment,

      prediction:
        assessment.prediction,
    });
  } catch (error) {
    console.error(
      "========== ASSESSMENT ERROR =========="
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Status:",
      error.response?.status
    );

    console.error(
      "Response:",
      error.response?.data
    );

    return res.status(
      error.response?.status || 500
    ).json({
      success: false,

      message:
        "Skin analysis failed",

      error:
        typeof error.response?.data ===
        "object"
          ? error.response.data
          : error.message,
    });
  }
}

// =====================================================
// GET ASSESSMENT BY ID
// GET /api/assessment/:id
// =====================================================

async function getAssessmentById(
  req,
  res
) {
  try {
    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid assessment ID",
      });
    }

    const assessment =
      await Assessment.findOne({
        _id: id,

        user: req.user._id,
      }).populate(
        "user",
        "fullName age gender"
      );

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message:
          "Assessment not found",
      });
    }

    return res.status(200).json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error(
      "GET ASSESSMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch assessment",

      error:
        error.message,
    });
  }
}

// =====================================================
// GET ASSESSMENT HISTORY
// GET /api/assessment/history
// =====================================================

async function getHistory(
  req,
  res
) {
  try {
    const history =
      await Assessment.find({
        user: req.user._id,

        status: "analyzed",
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      count: history.length,

      history,
    });
  } catch (error) {
    console.error(
      "GET ASSESSMENT HISTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch scan history",

      error:
        error.message,
    });
  }
}

module.exports = {
  getLatestAssessment,
  createAssessment,
  getAssessmentById,
  getHistory,
};