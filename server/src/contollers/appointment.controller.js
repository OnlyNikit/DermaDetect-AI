const mongoose = require("mongoose");

const Appointment = require("../models/appointment");
const DoctorProfile = require("../models/doctorProfile");
const Assessment = require("../models/skinAssessment");
const { isPastIST } = require("../utils/istTime");

const PATIENT_FIELDS = "fullName email gender age weight height";

// Populate helper (patient details + doctor + linked AI report)
const populateAppointment = (query) =>
  query
    .populate("patient", PATIENT_FIELDS)
    .populate("doctor", "fullName email")
    .populate("doctorProfile")
    .populate("assessment");

// =====================================================
// CREATE APPOINTMENT
// POST /api/appointments
// =====================================================

async function createAppointment(req, res) {
  try {
    const patientId = req.user._id;

    const {
      doctorProfileId,
      assessmentId,
      mode,
      date,
      startTime,
      endTime,
      reason,
      patientMessage,
    } = req.body;

    if (!doctorProfileId || !mode || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Doctor, mode, date, start time and end time are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorProfileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor profile ID",
      });
    }

    const doctorProfile = await DoctorProfile.findOne({
      _id: doctorProfileId,
      verificationStatus: "verified",
    });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Verified doctor not found",
      });
    }

    if (!doctorProfile.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Doctor is currently unavailable",
      });
    }

    if (
      !Array.isArray(doctorProfile.consultationModes) ||
      !doctorProfile.consultationModes.includes(mode)
    ) {
      return res.status(400).json({
        success: false,
        message: `Doctor does not provide ${mode} consultation`,
      });
    }

    // Format validation (timezone-safe: no toISOString comparison)
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date format",
      });
    }

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format (use HH:MM)",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // IST-based check (not `new Date(...)`, which parses in the
    // server's own timezone — wrong on a UTC host like Render).
    if (isPastIST(date, startTime)) {
      return res.status(400).json({
        success: false,
        message: "You cannot book an appointment in the past",
      });
    }

    // -------------------------------------------------
    // Date-wise availability check
    // The requested time must fit inside one of the
    // doctor's time frames for that exact date.
    // -------------------------------------------------

    const slotsForDate = (doctorProfile.availabilitySlots || []).filter(
      (slot) => slot.date === date
    );

    if (slotsForDate.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available on the selected date",
      });
    }

    const fitsInSlot = slotsForDate.some(
      (slot) => startTime >= slot.startTime && endTime <= slot.endTime
    );

    if (!fitsInSlot) {
      const ranges = slotsForDate
        .map((slot) => `${slot.startTime}-${slot.endTime}`)
        .join(", ");

      return res.status(400).json({
        success: false,
        message: `Selected time must be inside doctor's available time: ${ranges}`,
      });
    }

    // -------------------------------------------------
    // Assessment (must belong to this patient)
    // -------------------------------------------------

    if (assessmentId) {
      if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assessment ID",
        });
      }

      const assessment = await Assessment.findOne({
        _id: assessmentId,
        user: patientId,
      });

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: "Assessment not found or does not belong to this patient",
        });
      }
    }

    // -------------------------------------------------
    // Conflicts
    // -------------------------------------------------

    const patientConflict = await Appointment.findOne({
      patient: patientId,
      date,
      status: { $in: ["pending", "accepted"] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (patientConflict) {
      return res.status(409).json({
        success: false,
        message: "You already have another appointment at this time",
      });
    }

    const doctorConflict = await Appointment.findOne({
      doctor: doctorProfile.user,
      doctorProfile: doctorProfile._id,
      date,
      status: { $in: ["pending", "accepted"] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (doctorConflict) {
      return res.status(409).json({
        success: false,
        message: "This time slot is no longer available",
      });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorProfile.user,
      doctorProfile: doctorProfile._id,
      assessment: assessmentId || null,
      mode,
      date,
      startTime,
      endTime,
      reason: reason || "",
      patientMessage: patientMessage || "",
      status: "pending",
    });

    const populatedAppointment = await populateAppointment(
      Appointment.findById(appointment._id)
    );

    return res.status(201).json({
      success: true,
      message: "Appointment request sent successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("CREATE APPOINTMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create appointment",
      error: error.message,
    });
  }
}

// =====================================================
// GET PATIENT APPOINTMENTS
// GET /api/appointments/my
// =====================================================

async function getMyAppointments(req, res) {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate("doctor", "fullName email")
      .populate("doctorProfile")
      .populate("assessment")
      .sort({ date: -1, startTime: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("GET PATIENT APPOINTMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your appointments",
      error: error.message,
    });
  }
}

// =====================================================
// GET DOCTOR APPOINTMENTS
// GET /api/appointments/doctor
// Each appointment includes full patient details and the
// AI report the patient attached while booking.
// =====================================================

async function getDoctorAppointments(req, res) {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate("patient", PATIENT_FIELDS)
      .populate("doctorProfile")
      .populate("assessment")
      .sort({ date: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("GET DOCTOR APPOINTMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor appointments",
      error: error.message,
    });
  }
}

// =====================================================
// GET SINGLE APPOINTMENT
// GET /api/appointments/:id
// =====================================================

async function getAppointmentById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await populateAppointment(Appointment.findById(id));

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const currentUserId = req.user._id.toString();
    const patientId = appointment.patient?._id?.toString();
    const doctorId = appointment.doctor?._id?.toString();

    if (currentUserId !== patientId && currentUserId !== doctorId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this appointment",
      });
    }

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("GET APPOINTMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
      error: error.message,
    });
  }
}

// =====================================================
// STATUS CHANGE HELPERS (doctor only)
// =====================================================

function makeStatusHandler({ from, to, label }) {
  return async function (req, res) {
    try {
      const appointment = await Appointment.findOne({
        _id: req.params.id,
        doctor: req.user._id,
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      if (appointment.status !== from) {
        return res.status(400).json({
          success: false,
          message: `Only ${from} appointments can be ${label}`,
        });
      }

      appointment.status = to;
      await appointment.save();

      const populated = await populateAppointment(
        Appointment.findById(appointment._id)
      );

      return res.status(200).json({
        success: true,
        message: `Appointment ${to}`,
        appointment: populated,
      });
    } catch (error) {
      console.error(`${label.toUpperCase()} APPOINTMENT ERROR:`, error);

      return res.status(500).json({
        success: false,
        message: `Failed to update appointment`,
        error: error.message,
      });
    }
  };
}

const acceptAppointment = makeStatusHandler({
  from: "pending",
  to: "accepted",
  label: "accepted",
});

const rejectAppointment = makeStatusHandler({
  from: "pending",
  to: "rejected",
  label: "rejected",
});

const completeAppointment = makeStatusHandler({
  from: "accepted",
  to: "completed",
  label: "completed",
});

// Generic: PATCH /api/appointments/:id/status  { status: "accepted" | "rejected" }
async function updateAppointmentStatus(req, res) {
  const { status } = req.body;

  if (status === "accepted") return acceptAppointment(req, res);
  if (status === "rejected") return rejectAppointment(req, res);
  if (status === "completed") return completeAppointment(req, res);

  return res.status(400).json({
    success: false,
    message: "Invalid status",
  });
}

// =====================================================
// CANCEL APPOINTMENT (patient)
// =====================================================

async function cancelAppointment(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const currentUserId = req.user._id.toString();
    const isPatient = appointment.patient?.toString() === currentUserId;
    const isDoctor = appointment.doctor?.toString() === currentUserId;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this appointment",
      });
    }

    if (!["pending", "accepted"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "This appointment cannot be cancelled",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled",
      appointment,
    });
  } catch (error) {
    console.error("CANCEL APPOINTMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
}

// =====================================================
// UPDATE DOCTOR NOTES
// =====================================================

async function updateDoctorNotes(req, res) {
  try {
    const { doctorNotes } = req.body;

    if (doctorNotes === undefined) {
      return res.status(400).json({
        success: false,
        message: "Doctor notes are required",
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.doctorNotes = doctorNotes;
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Doctor notes updated",
      doctorNotes: appointment.doctorNotes,
    });
  } catch (error) {
    console.error("UPDATE DOCTOR NOTES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update doctor notes",
      error: error.message,
    });
  }
}

module.exports = {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  acceptAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment,
  updateAppointmentStatus,
  updateDoctorNotes,
};