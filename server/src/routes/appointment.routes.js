const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const allowRoles = require("../middlewares/role");

const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  acceptAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment,
  updateDoctorNotes,
} = require("../contollers/appointment.controller");


// ===============================
// PATIENT
// ===============================

router.post(
  "/",
  authMiddleware,
  allowRoles("patient"),
  createAppointment
);

router.get(
  "/my",
  authMiddleware,
  allowRoles("patient"),
  getMyAppointments
);

router.patch(
  "/:id/cancel",
  authMiddleware,
  allowRoles("patient"),
  cancelAppointment
);


// ===============================
// DOCTOR
// ===============================

router.get(
  "/doctor",
  authMiddleware,
  allowRoles("doctor"),
  getDoctorAppointments
);

router.get(
  "/:id",
  authMiddleware,
  allowRoles("patient", "doctor"),
  getAppointmentById
);

router.patch(
  "/:id/accept",
  authMiddleware,
  allowRoles("doctor"),
  acceptAppointment
);

router.patch(
  "/:id/reject",
  authMiddleware,
  allowRoles("doctor"),
  rejectAppointment
);

router.patch(
  "/:id/complete",
  authMiddleware,
  allowRoles("doctor"),
  completeAppointment
);

router.patch(
  "/:id/notes",
  authMiddleware,
  allowRoles("doctor"),
  updateDoctorNotes
);


module.exports = router;