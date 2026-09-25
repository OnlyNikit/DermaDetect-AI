const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const allowRoles = require("../middlewares/role");

const {
  createDoctorProfile,
  getMyDoctorProfile,
  updateMyProfile,
  updateMyAvailability,
  updateAvailability,
  getDoctors,
  getDoctorById,
} = require("../contollers/doctor.controller");

// =====================================================
// DOCTOR — specific routes FIRST (must stay above "/:id")
// =====================================================

// Create doctor profile
router.post("/profile", authMiddleware, allowRoles("doctor"), createDoctorProfile);

// Get own doctor profile
router.get("/profile/me", authMiddleware, allowRoles("doctor"), getMyDoctorProfile);

// Update own profile (specialization, fee, bio, modes, etc.)
router.put("/profile/me", authMiddleware, allowRoles("doctor"), updateMyProfile);

// Update own availability — NEW date-wise format
router.put(
  "/availability/me",
  authMiddleware,
  allowRoles("doctor"),
  updateMyAvailability
);

// Legacy weekly availability route (kept so nothing old breaks)
router.put("/availability", authMiddleware, allowRoles("doctor"), updateAvailability);

// =====================================================
// PATIENT / AUTHENTICATED USER — generic routes LAST
// =====================================================

// Get all available onboarded doctors
router.get("/", authMiddleware, getDoctors);

// Get single doctor (must be last: "/:id" would otherwise
// swallow routes like "/profile/me")
router.get("/:id", authMiddleware, getDoctorById);

module.exports = router;