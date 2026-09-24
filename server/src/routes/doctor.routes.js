const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middlewares/auth");

const allowRoles =
  require("../middlewares/role");

const {
  createDoctorProfile,
  getMyDoctorProfile,
  updateAvailability,
  getDoctors,
  getDoctorById,
} = require("../contollers/doctor.controller");

// =====================================================
// PUBLIC / PATIENT / AUTHENTICATED DOCTOR DISCOVERY
// =====================================================

// GET /api/doctors
router.get(
  "/",
  authMiddleware,
  getDoctors
);

// =====================================================
// DOCTOR PROFILE
// =====================================================

// CREATE DOCTOR PROFILE
// POST /api/doctors/profile

router.post(
  "/profile",
  authMiddleware,
  allowRoles("doctor"),
  createDoctorProfile
);

// GET LOGGED-IN DOCTOR PROFILE
// GET /api/doctors/profile/me

router.get(
  "/profile/me",
  authMiddleware,
  allowRoles("doctor"),
  getMyDoctorProfile
);

// =====================================================
// DOCTOR AVAILABILITY
// =====================================================

// PUT /api/doctors/availability

router.put(
  "/availability",
  authMiddleware,
  allowRoles("doctor"),
  updateAvailability
);

// =====================================================
// SINGLE VERIFIED DOCTOR
// IMPORTANT: Keep this AFTER /profile/me
// =====================================================

// GET /api/doctors/:id

router.get(
  "/:id",
  authMiddleware,
  getDoctorById
);

module.exports = router;