const mongoose = require("mongoose");

const Appointment = require("../models/appointment");
const DoctorProfile = require("../models/doctorProfile");
const Assessment = require("../models/skinAssessment");


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

    // -------------------------------------------------
    // Required fields
    // -------------------------------------------------

    if (
      !doctorProfileId ||
      !mode ||
      !date ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor, mode, date, start time and end time are required",
      });
    }

    // -------------------------------------------------
    // Validate doctor profile ID
    // -------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(doctorProfileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor profile ID",
      });
    }

    // -------------------------------------------------
    // Find verified doctor
    // -------------------------------------------------

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

    // -------------------------------------------------
    // Doctor availability
    // -------------------------------------------------

    if (!doctorProfile.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Doctor is currently unavailable",
      });
    }

    // -------------------------------------------------
    // Consultation mode
    // -------------------------------------------------

    if (!doctorProfile.consultationModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: `Doctor does not provide ${mode} consultation`,
      });
    }

    // -------------------------------------------------
    // Validate time
    // -------------------------------------------------

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // -------------------------------------------------
    // Validate date
    // -------------------------------------------------

    const selectedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date",
      });
    }

    // -------------------------------------------------
    // Check doctor weekly availability
    // -------------------------------------------------

    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const availableDay = doctorProfile.availability.find(
      (slot) =>
        slot.day === dayName &&
        slot.enabled === true
    );

    if (!availableDay) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available on ${dayName}`,
      });
    }

    // -------------------------------------------------
    // Check selected time
    // -------------------------------------------------

    if (
      startTime < availableDay.startTime ||
      endTime > availableDay.endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Selected time must be between ${availableDay.startTime} and ${availableDay.endTime}`,
      });
    }

    // -------------------------------------------------
    // Prevent past appointment
    // -------------------------------------------------

    const appointmentDateTime = new Date(
      `${date}T${startTime}:00`
    );

    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "You cannot book an appointment in the past",
      });
    }

    // -------------------------------------------------
    // Validate assessment if provided
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
          message:
            "Assessment not found or does not belong to this patient",
        });
      }
    }

    // -------------------------------------------------
    // Patient conflict
    // -------------------------------------------------

    const patientConflict = await Appointment.findOne({
      patient: patientId,
      date,
      status: {
        $in: ["pending", "accepted"],
      },
      startTime: {
        $lt: endTime,
      },
      endTime: {
        $gt: startTime,
      },
    });

    if (patientConflict) {
      return res.status(409).json({
        success: false,
        message:
          "You already have another appointment at this time",
      });
    }

    // -------------------------------------------------
    // Doctor conflict
    // -------------------------------------------------

    const doctorConflict = await Appointment.findOne({
      doctor: doctorProfile.user,
      doctorProfile: doctorProfile._id,
      date,
      status: {
        $in: ["pending", "accepted"],
      },
      startTime: {
        $lt: endTime,
      },
      endTime: {
        $gt: startTime,
      },
    });

    if (doctorConflict) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is no longer available",
      });
    }

    // -------------------------------------------------
    // Create appointment
    // -------------------------------------------------

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

    // -------------------------------------------------
    // Populate response
    // -------------------------------------------------

    const populatedAppointment =
      await Appointment.findById(appointment._id)
        .populate(
          "patient",
          "fullName email gender age weight height"
        )
        .populate(
          "doctor",
          "fullName email"
        )
        .populate("doctorProfile")
        .populate("assessment");

    return res.status(201).json({
      success: true,
      message:
        "Appointment request sent successfully",

      appointment: populatedAppointment,
    });

  } catch (error) {
    console.error(
      "CREATE APPOINTMENT ERROR:",
      error
    );

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
    const appointments =
      await Appointment.find({
        patient: req.user._id,
      })
        .populate(
          "doctor",
          "fullName email"
        )
        .populate("doctorProfile")
        .populate("assessment")
        .sort({
          date: -1,
          startTime: -1,
        });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });

  } catch (error) {
    console.error(
      "GET PATIENT APPOINTMENTS:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch your appointments",
    });
  }
}


// =====================================================
// GET DOCTOR APPOINTMENTS
// GET /api/appointments/doctor
// =====================================================
async function getDoctorAppointments(req, res) {
  try {
    const doctorId = req.user._id;

    const appointments =
      await Appointment.find({
        doctor: doctorId,
      })
        .populate(
          "patient",
          "fullName email gender age weight height"
        )
        .populate(
          "doctorProfile"
        )
        .populate(
          "assessment"
        )
        .sort({
          date: 1,
          startTime: 1,
        });


    const appointmentsWithReports =
      await Promise.all(
        appointments.map(
          async (appointment) => {

            let latestAssessment =
              appointment.assessment ||
              null;


            // If booking does not contain
            // assessment, find latest
            // analyzed assessment of patient.

            if (
              !latestAssessment &&
              appointment.patient?._id
            ) {
              latestAssessment =
                await Assessment.findOne({
                  user:
                    appointment.patient._id,

                  status: "analyzed",
                }).sort({
                  createdAt: -1,
                });
            }


            return {
              ...appointment.toObject(),

              // Explicitly expose report
              assessment:
                appointment.assessment ||
                null,

              latestAssessment:
                latestAssessment,
            };
          }
        )
      );


    return res.status(200).json({
      success: true,

      count:
        appointmentsWithReports.length,

      appointments:
        appointmentsWithReports,
    });

  } catch (error) {

    console.error(
      "GET DOCTOR APPOINTMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch doctor appointments",

      error:
        error.message,
    });
  }
}

    // -------------------------------------------------
    // Attach latest assessment
    // -------------------------------------------------

    const appointmentsWithReports =
      await Promise.all(
        appointments.map(async (appointment) => {

          let latestAssessment =
            appointment.assessment || null;

          // If appointment doesn't have assessment,
          // find patient's latest assessment.
          if (!latestAssessment && appointment.patient?._id) {

            latestAssessment =
              await Assessment.findOne({
                user: appointment.patient._id,
                status: "analyzed",
              }).sort({
                createdAt: -1,
              });
          }

          return {
            ...appointment.toObject(),

            latestAssessment,
          };
        })
      );

    return res.status(200).json({
      success: true,

      count: appointmentsWithReports.length,

      appointments: appointmentsWithReports,
    });

  } catch (error) {

    console.error(
      "GET DOCTOR APPOINTMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch doctor appointments",

      error: error.message,
    });
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

    const appointment =
      await Appointment.findById(id)
        .populate(
          "patient",
          "fullName email gender age weight height"
        )
        .populate(
          "doctor",
          "fullName email"
        )
        .populate("doctorProfile")
        .populate("assessment");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const currentUserId =
      req.user._id.toString();

    const patientId =
      appointment.patient._id.toString();

    const doctorId =
      appointment.doctor._id.toString();

    if (
      currentUserId !== patientId &&
      currentUserId !== doctorId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view this appointment",
      });
    }

    // Latest assessment of patient
    const latestAssessment =
      await Assessment.findOne({
        user: appointment.patient._id,
        status: "analyzed",
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      appointment,

      latestAssessment,
    });

  } catch (error) {

    console.error(
      "GET APPOINTMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch appointment",
    });
  }
}


// =====================================================
// ACCEPT APPOINTMENT
// PATCH /api/appointments/:id/accept
// =====================================================

async function acceptAppointment(req, res) {
  try {

    const appointment =
      await Appointment.findOne({
        _id: req.params.id,
        doctor: req.user._id,
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending appointments can be accepted",
      });
    }

    appointment.status = "accepted";

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment accepted",
      appointment,
    });

  } catch (error) {

    console.error(
      "ACCEPT APPOINTMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to accept appointment",
    });
  }
}


// =====================================================
// REJECT APPOINTMENT
// PATCH /api/appointments/:id/reject
// =====================================================

async function rejectAppointment(req, res) {
  try {

    const appointment =
      await Appointment.findOne({
        _id: req.params.id,
        doctor: req.user._id,
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending appointments can be rejected",
      });
    }

    appointment.status = "rejected";

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment rejected",
      appointment,
    });

  } catch (error) {

    console.error(
      "REJECT APPOINTMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reject appointment",
    });
  }
}


// =====================================================
// CANCEL APPOINTMENT
// PATCH /api/appointments/:id/cancel
// =====================================================

async function cancelAppointment(req, res) {
  try {

    const appointment =
      await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const currentUserId =
      req.user._id.toString();

    const isPatient =
      appointment.patient.toString() ===
      currentUserId;

    const isDoctor =
      appointment.doctor.toString() ===
      currentUserId;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to cancel this appointment",
      });
    }

    if (
      !["pending", "accepted"].includes(
        appointment.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This appointment cannot be cancelled",
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

    console.error(
      "CANCEL APPOINTMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel appointment",
    });
  }
}


// =====================================================
// COMPLETE APPOINTMENT
// PATCH /api/appointments/:id/complete
// =====================================================

async function completeAppointment(req, res) {
  try {

    const appointment =
      await Appointment.findOne({
        _id: req.params.id,
        doctor: req.user._id,
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message:
          "Only accepted appointments can be completed",
      });
    }

    appointment.status = "completed";

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment completed",
      appointment,
    });

  } catch (error) {

    console.error(
      "COMPLETE APPOINTMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to complete appointment",
    });
  }
}


// =====================================================
// DOCTOR NOTES
// PATCH /api/appointments/:id/notes
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

    const appointment =
      await Appointment.findOne({
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

    console.error(
      "UPDATE DOCTOR NOTES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update doctor notes",
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
  updateDoctorNotes,
};