const DoctorProfile = require("../models/doctorProfile");

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

    // Required fields
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

    // Check if doctor already has profile
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

    // Check registration number
    const registrationExists = await DoctorProfile.findOne({
      registrationNumber: registrationNumber.trim(),
    });

    if (registrationExists) {
      return res.status(409).json({
        success: false,
        message: "Registration number already exists",
      });
    }

    // Create profile
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

      languages: Array.isArray(languages)
        ? languages
        : [],

      consultationModes:
        Array.isArray(consultationModes) &&
        consultationModes.length > 0
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

      availability: [],
    });

    return res.status(201).json({
      success: true,

      message:
        "Doctor profile created successfully",

      profile,
    });
  } catch (error) {
    console.error(
      "CREATE DOCTOR PROFILE ERROR:",
      error
    );

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
    }).populate(
      "user",
      "fullName email gender age role"
    );

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
    console.error(
      "GET MY DOCTOR PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor profile",
    });
  }
}


// =====================================================
// UPDATE AVAILABILITY
// PUT /api/doctors/availability
// =====================================================

async function updateAvailability(req, res) {
  try {
    const {
      availability,
      isAvailable,
    } = req.body;

    const profile = await DoctorProfile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    profile.availability =
      Array.isArray(availability)
        ? availability
        : [];

    if (isAvailable !== undefined) {
      profile.isAvailable = Boolean(
        isAvailable
      );
    }

    await profile.save();

    return res.status(200).json({
      success: true,

      message: "Availability updated",

      availability: profile.availability,

      isAvailable: profile.isAvailable,
    });
  } catch (error) {
    console.error(
      "UPDATE AVAILABILITY ERROR:",
      error
    );

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
    const {
      city,
      specialization,
      mode,
    } = req.query;

    // =================================================
    // ONLY ONBOARDED + VERIFIED + AVAILABLE DOCTORS
    // =================================================

    const query = {
      verificationStatus: "verified",
      isAvailable: true,
    };

    if (city?.trim()) {
      query.city = new RegExp(
        city.trim(),
        "i"
      );
    }

    if (specialization?.trim()) {
      query.specialization = new RegExp(
        specialization.trim(),
        "i"
      );
    }

    if (mode) {
      query.consultationModes = mode;
    }

    const doctors =
      await DoctorProfile.find(query)
        .populate(
          "user",
          "fullName email gender age"
        )
        .sort({
          experience: -1,
        });

    return res.status(200).json({
      success: true,

      count: doctors.length,

      doctors,
    });
  } catch (error) {
    console.error(
      "GET DOCTORS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
}


// =====================================================
// GET DOCTOR BY ID
// GET /api/doctors/:id
// =====================================================

async function getDoctorById(req, res) {
  try {
    const { id } = req.params;

    const doctor =
      await DoctorProfile.findOne({
        _id: id,

        verificationStatus: "verified",

        isAvailable: true,
      }).populate(
        "user",
        "fullName email"
      );

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
    console.error(
      "GET DOCTOR BY ID ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
    });
  }
}


module.exports = {
  createDoctorProfile,
  getMyDoctorProfile,
  updateAvailability,
  getDoctors,
  getDoctorById,
};