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
// PATIENT / AUTHENTICATED USER
// =====================================================

// Get all available onboarded doctors
router.get(
  "/",
  authMiddleware,
  getDoctors
);


// Get single doctor
router.get(
  "/:id",
  authMiddleware,
  getDoctorById
);


// =====================================================
// DOCTOR
// =====================================================

// Create doctor profile
router.post(
  "/profile",
  authMiddleware,
  allowRoles("doctor"),
  createDoctorProfile
);


// Get own doctor profile
router.get(
  "/profile/me",
  authMiddleware,
  allowRoles("doctor"),
  getMyDoctorProfile
);


// Update availability
router.put(
  "/availability",
  authMiddleware,
  allowRoles("doctor"),
  updateAvailability
);


module.exports = router;