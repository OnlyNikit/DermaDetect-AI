const express = require("express");

const router = express.Router();

const {
  getAssessmentForDoctor,
} = require("../contollers/doctorAssessment.controller"); // note: matches your existing "contollers" folder spelling

const authMiddleware = require("../middlewares/auth");

// ==========================================
// GET SINGLE ASSESSMENT (DOCTOR VIEW)
// GET /api/doctor/assessment/:assessmentId
// ==========================================

router.get(
  "/:assessmentId",
  authMiddleware,
  getAssessmentForDoctor
);

module.exports = router;