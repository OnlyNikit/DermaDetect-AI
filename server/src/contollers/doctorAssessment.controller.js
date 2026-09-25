const mongoose = require("mongoose");

const Assessment = require("../models/skinAssessment");
const Appointment = require("../models/appointment");

// =====================================================
// GET ASSESSMENT BY ID (FOR DOCTOR)
// GET /api/doctor/assessment/:assessmentId
//
// Unlike the patient-side getAssessmentById, this does
// NOT check `user: req.user._id` on the Assessment,
// because the logged-in user here is the DOCTOR, not
// the patient who owns the assessment.
//
// Instead, we verify the doctor is authorized to view
// this specific assessment by checking there is an
// Appointment linking this doctor to this assessment.
//
// Appointment.doctor stores the User._id directly
// (not the DoctorProfile._id), so req.user._id is
// compared straight against it.
// =====================================================

async function getAssessmentForDoctor(req, res) {
  try {
    const { assessmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment ID",
      });
    }

    // --------------------------------------------------
    // Authorization check: does an appointment exist
    // linking THIS doctor (User._id) to THIS assessment?
    // --------------------------------------------------

    const appointment = await Appointment.findOne({
      doctor: req.user._id,
      assessment: assessmentId,
    });

    if (!appointment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this patient's report",
      });
    }

    // --------------------------------------------------
    // Fetch the assessment itself
    // --------------------------------------------------

    const assessment = await Assessment.findById(
      assessmentId
    ).populate("user", "fullName age gender email");

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    return res.status(200).json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error("GET DOCTOR ASSESSMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assessment",
      error: error.message,
    });
  }
}

module.exports = {
  getAssessmentForDoctor,
};