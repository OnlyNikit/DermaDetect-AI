const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const allowRoles = require("../middlewares/role");

const {
  createDoctorProfile,
  getMyDoctorProfile,
  updateAvailability,
  getDoctors,
  getDoctorById,
} = require("../contollers/doctor.controller");

// Public/Patient can see verified doctors
router.get("/", authMiddleware, getDoctors);

router.get(
  "/:id",
  authMiddleware,
  getDoctorById
);

// Doctor only
router.post(
  "/profile",
  authMiddleware,
  allowRoles("doctor"),
  createDoctorProfile
);

router.get(
  "/profile/me",
  authMiddleware,
  allowRoles("doctor"),
  getMyDoctorProfile
);

router.put(
  "/availability",
  authMiddleware,
  allowRoles("doctor"),
  updateAvailability
);

module.exports = router;