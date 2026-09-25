const express = require("express");

const router =
  express.Router();

const {
  getLatestAssessment,
  createAssessment,
  getAssessmentById,
  getHistory,
} = require(
  "../contollers/assessment.controller"
);

const authMiddleware =
  require("../middlewares/auth");

// ==========================================
// LATEST
// GET /api/assessment/latest
// ==========================================

router.get(
  "/latest",
  authMiddleware,
  getLatestAssessment
);

// ==========================================
// CREATE
// POST /api/assessment
// ==========================================

router.post(
  "/",
  authMiddleware,
  createAssessment
);

// ==========================================
// HISTORY
// GET /api/assessment/history
// ==========================================

router.get(
  "/history",
  authMiddleware,
  getHistory
);

// ==========================================
// SINGLE
// GET /api/assessment/:id
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  getAssessmentById
);

module.exports = router;