const phoneSession = require("../models/phoneSession");

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

const getPhoneSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await phoneSession.findOne({ sessionId });

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
    });
  } catch (err) {
    console.error("get phone session error", err);

    return res.status(500).json({
      success: false,
      message: "unable to get session status",
    });
  }
};

const uploadPhoneImage = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "image is required",
      });
    }
    const session = await phoneSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or expired",
      });
    }

    // const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const imageUrl = req.file.path; // Cloudinary ka URL yahan already aa jaata hai

    session.status = "uploaded";
    session.imageUrl = imageUrl;
    await session.save();

    // ↓↓↓ YE PART BADLO ↓↓↓
    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl,
    });
  } catch (err) {
    console.error("image not uploaded", err);
    return res.status(500).json({
      success: false,
      message: "unable to upload image",
    });
  }
};

module.exports = {
  createPhoneSession,
  getPhoneSession,
  uploadPhoneImage,
};
