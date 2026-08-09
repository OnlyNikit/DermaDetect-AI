const express = require("express");
const router = express.Router();

const {
  createAssessment,
  getAssessmentById,
  getHistory,
} = require("../contollers/assessment.controller");

const authMiddleware = require("../middlewares/auth");

router.post("/", authMiddleware, createAssessment);

// IMPORTANT: /history must come BEFORE /:id, otherwise Express treats
// "history" as the :id param and getAssessmentById runs instead.
router.get("/history", authMiddleware, getHistory);

router.get("/:id", authMiddleware, getAssessmentById);

module.exports = router;