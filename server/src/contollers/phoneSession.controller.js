const phoneSession = require("../models/phoneSession");
const axios = require("axios");

// ================================
// CREATE PHONE SESSION
// ================================
const createPhoneSession = async (req, res) => {
  try {
    const session = await phoneSession.create({});

    return res.status(201).json({
      success: true,
      sessionId: session.sessionId,
      status: session.status,
    });
  } catch (err) {
    console.error("create Phone Session Error", err);

    return res.status(500).json({
      success: false,
      message: "unable To create phone Session",
    });
  }
};

// ================================
// GET PHONE SESSION
// LAPTOP POLLING
// ================================
const getPhoneSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await phoneSession.findOne({
      sessionId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "session not found or expired",
      });
    }

    return res.status(200).json({
      success: true,
      status: session.status,
      imageUrl: session.imageUrl,
      message: session.message || null,
    });
  } catch (err) {
    console.error("get phone session error", err);

    return res.status(500).json({
      success: false,
      message: "unable to get session status",
    });
  }
};

// ================================
// UPLOAD PHONE IMAGE
// ================================
const uploadPhoneImage = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // --------------------------------
    // CHECK IMAGE
    // --------------------------------
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "image is required",
      });
    }

    // --------------------------------
    // CHECK SESSION
    // --------------------------------
    const session = await phoneSession.findOne({
      sessionId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or expired",
      });
    }

    // --------------------------------
    // CLOUDINARY URL
    // --------------------------------
    const imageUrl = req.file.path;

    console.log("========== PHONE IMAGE ==========");

    console.log("Session ID:", sessionId);

    console.log("Image URL:", imageUrl);

    // --------------------------------
    // CHECK AI SERVICE
    // --------------------------------
    if (!process.env.AI_SERVICE_URL) {
      return res.status(500).json({
        success: false,
        message: "AI service URL is not configured",
      });
    }

    // --------------------------------
    // VALIDATE IMAGE
    // --------------------------------
    console.log("Sending phone image for validation...");

    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/validate`,
      {
        imageUrl,
      },
      {
        timeout: 60000,
      },
    );

    console.log("AI validation response:", aiResponse.data);

    const validation = aiResponse.data;

    // --------------------------------
    // INVALID IMAGE
    // --------------------------------
    if (validation.status === "invalid_image") {
      session.status = "invalid_image";

      session.imageUrl = imageUrl;

      session.message =
        validation.message || "Please upload a clear skin image.";

      await session.save();

      return res.status(200).json({
        success: true,
        status: "invalid_image",
        message: session.message,
        imageUrl,
      });
    }

    // --------------------------------
    // NORMAL SKIN
    // --------------------------------
    if (validation.status === "normal_skin") {
      session.status = "normal_skin";

      session.imageUrl = imageUrl;

      session.message =
        validation.message || "No apparent skin disease detected.";

      await session.save();

      return res.status(200).json({
        success: true,
        status: "normal_skin",
        message: session.message,
        imageUrl,
      });
    }

    // --------------------------------
    // VALID SKIN / DISEASE-LIKE IMAGE
    // --------------------------------
    if (validation.status === "valid_skin") {
      session.status = "uploaded";

      session.imageUrl = imageUrl;

      session.message = validation.message || "Skin image accepted.";

      await session.save();

      return res.status(200).json({
        success: true,
        status: "uploaded",
        message: session.message,
        imageUrl,
      });
    }

    // --------------------------------
    // UNKNOWN AI RESPONSE
    // --------------------------------
    session.status = "failed";

    session.imageUrl = imageUrl;

    session.message = "Unable to validate image.";

    await session.save();

    return res.status(500).json({
      success: false,
      status: "failed",
      message: "Unable to validate image.",
    });
  } catch (err) {
    console.error("image not uploaded", err);

    console.error("AI response:", err.response?.data);

    return res.status(err.response?.status || 500).json({
      success: false,
      message:
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "unable to upload image",
    });
  }
};

module.exports = {
  createPhoneSession,
  getPhoneSession,
  uploadPhoneImage,
};
