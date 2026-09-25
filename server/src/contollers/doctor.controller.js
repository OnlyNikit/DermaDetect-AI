const DoctorProfile = require("../models/doctorProfile");
const { todayIST } = require("../utils/istTime");

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// =====================================================
// CREATE DOCTOR PROFILE / ONBOARDING
// POST /api/doctors/profile
// =====================================================

async function createDoctorProfile(req, res) {
  try {
    const {
      specialization,
      qualification,
      registrationNumber,
      experience,
      hospital,
      clinic,
      city,
      address,
      consultationFee,
      languages,
      consultationModes,
      bio,
      profileImage,
    } = req.body;

    if (
      !specialization ||
      !qualification ||
      !registrationNumber ||
      experience === undefined ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        message: "Required professional information is missing",
      });
    }

    const existingProfile = await DoctorProfile.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Doctor profile already exists",
        profile: existingProfile,
      });
    }

    const registrationExists = await DoctorProfile.findOne({
      registrationNumber: registrationNumber.trim(),
    });

    if (registrationExists) {
      return res.status(409).json({
        success: false,
        message: "Registration number already exists",
      });
    }

    const profile = await DoctorProfile.create({
      user: req.user._id,
      specialization: specialization.trim(),
      qualification: qualification.trim(),
      registrationNumber: registrationNumber.trim(),
      experience: Number(experience),
      hospital: hospital?.trim() || "",
      clinic: clinic?.trim() || "",
      city: city.trim(),
      address: address?.trim() || "",
      consultationFee: Number(consultationFee) || 0,
      languages: Array.isArray(languages) ? languages : [],
      consultationModes:
        Array.isArray(consultationModes) && consultationModes.length > 0
          ? consultationModes
          : ["text"],
      bio: bio?.trim() || "",
      profileImage: profileImage || "",

      // =================================================
      // DEMO / HACKATHON MODE
      // Doctor becomes visible immediately after onboarding
      // =================================================
      verificationStatus: "verified",
      isAvailable: true,
      availabilitySlots: [],
      availability: [],
    });

    return res.status(201).json({
      success: true,
      message: "Doctor profile created successfully",
      profile,
    });
  } catch (error) {
    console.error("CREATE DOCTOR PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create doctor profile",
      error: error.message,
    });
  }
}

// =====================================================
// GET MY DOCTOR PROFILE
// GET /api/doctors/profile/me
// =====================================================

async function getMyDoctorProfile(req, res) {
  try {
    const profile = await DoctorProfile.findOne({
      user: req.user._id,
    }).populate("user", "fullName email gender age role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("GET MY DOCTOR PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor profile",
    });
  }
}

// =====================================================
// UPDATE MY PROFILE
// PUT /api/doctors/profile/me
// (specialization, fee, bio, modes, etc. — NOT
// registrationNumber / verificationStatus / user)
// =====================================================

async function updateMyProfile(req, res) {
  try {
    const allowed = [
      "specialization",
      "qualification",
      "experience",
      "hospital",
      "clinic",
      "city",
      "address",
      "consultationFee",
      "languages",
      "consultationModes",
      "bio",
      "profileImage",
      "isAvailable",
    ];

    const profile = await DoctorProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        profile[key] = req.body[key];
      }
    }

    if (
      Array.isArray(profile.consultationModes) &&
      profile.consultationModes.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Select at least one consultation mode",
      });
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("UPDATE DOCTOR PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
}

// =====================================================
// UPDATE MY AVAILABILITY (date-wise, multiple time frames)
// PUT /api/doctors/availability/me
// body: {
//   isAvailable: true,
//   slots: [{ date: "2026-10-01", startTime: "10:00", endTime: "13:00" }, ...]
// }
// =====================================================

async function updateMyAvailability(req, res) {
  try {
    const { slots, isAvailable } = req.body;

    if (!Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: "slots must be an array",
      });
    }

    const today = todayIST();
    const cleaned = [];

    for (const slot of slots) {
      const { date, startTime, endTime } = slot || {};

      if (!DATE_REGEX.test(date || "")) {
        return res.status(400).json({
          success: false,
          message: `Invalid date: ${date}`,
        });
      }

      if (!TIME_REGEX.test(startTime || "") || !TIME_REGEX.test(endTime || "")) {
        return res.status(400).json({
          success: false,
          message: `Invalid time on ${date} (use HH:MM)`,
        });
      }

      if (startTime >= endTime) {
        return res.status(400).json({
          success: false,
          message: `End time must be after start time on ${date}`,
        });
      }

      // past dates are dropped silently
      if (date < today) continue;

      cleaned.push({ date, startTime, endTime });
    }

    cleaned.sort((a, b) =>
      a.date === b.date
        ? a.startTime.localeCompare(b.startTime)
        : a.date.localeCompare(b.date)
    );

    for (let i = 1; i < cleaned.length; i++) {
      const prev = cleaned[i - 1];
      const curr = cleaned[i];

      if (prev.date === curr.date && curr.startTime < prev.endTime) {
        return res.status(400).json({
          success: false,
          message: `Time frames overlap on ${curr.date}`,
        });
      }
    }

    const profile = await DoctorProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    profile.availabilitySlots = cleaned;

    if (typeof isAvailable === "boolean") {
      profile.isAvailable = isAvailable;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      profile,
    });
  } catch (error) {
    console.error("UPDATE AVAILABILITY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update availability",
      error: error.message,
    });
  }
}

// =====================================================
// (Legacy) UPDATE AVAILABILITY — old weekly format
// PUT /api/doctors/availability
// Kept only so nothing breaks if something old still
// calls this route. New frontend uses /availability/me.
// =====================================================

async function updateAvailability(req, res) {
  try {
    const { availability, isAvailable } = req.body;

    const profile = await DoctorProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    profile.availability = Array.isArray(availability) ? availability : [];

    if (isAvailable !== undefined) {
      profile.isAvailable = Boolean(isAvailable);
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Availability updated",
      availability: profile.availability,
      isAvailable: profile.isAvailable,
    });
  } catch (error) {
    console.error("UPDATE AVAILABILITY (legacy) ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update availability",
    });
  }
}

// =====================================================
// GET DOCTORS
// GET /api/doctors
// =====================================================

async function getDoctors(req, res) {
  try {
    const { city, specialization, mode } = req.query;

    const query = {
      verificationStatus: "verified",
      isAvailable: true,
    };

    if (city?.trim()) {
      query.city = new RegExp(city.trim(), "i");
    }

    if (specialization?.trim()) {
      query.specialization = new RegExp(specialization.trim(), "i");
    }

    if (mode) {
      query.consultationModes = mode;
    }

    const doctors = await DoctorProfile.find(query)
      .populate("user", "fullName email gender age")
      .sort({ experience: -1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("GET DOCTORS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
}

// =====================================================
// GET DOCTOR BY ID
// GET /api/doctors/:id
// (returns full profile including availabilitySlots,
// which the booking page needs)
// =====================================================

async function getDoctorById(req, res) {
  try {
    const { id } = req.params;

    const doctor = await DoctorProfile.findOne({
      _id: id,
      verificationStatus: "verified",
      isAvailable: true,
    }).populate("user", "fullName email");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("GET DOCTOR BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
    });
  }
}

module.exports = {
  createDoctorProfile,
  getMyDoctorProfile,
  updateMyProfile,
  updateMyAvailability,
  updateAvailability,
  getDoctors,
  getDoctorById,
};