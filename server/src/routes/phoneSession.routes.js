const express = require("express");
const router = express.Router();

const {
  createPhoneSession,
  getPhoneSession,
  uploadPhoneImage,
} = require("../contollers/phoneSession.controller");

const upload = require("../middlewares/upload");

// ================================
// CREATE QR PHONE SESSION
// ================================
router.post("/phone-session", createPhoneSession);

// ================================
// LAPTOP POLLING
// ================================
router.get("/phone-session/:sessionId", getPhoneSession);

// ================================
// PHONE IMAGE UPLOAD
// ================================
router.post(
  "/phone-upload/:sessionId",
  upload.single("image"),
  uploadPhoneImage,
);

module.exports = router;
