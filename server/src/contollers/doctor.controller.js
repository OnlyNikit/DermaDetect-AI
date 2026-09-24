const DoctorProfile = require("../models/doctorProfile");
const User = require("../models/user");

// =====================================================
// CREATE DOCTOR PROFILE
// POST /api/doctors/profile
// =====================================================

async function createDoctorProfile(req, res) {
  try {
    const userId = req.user._id;

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

    // ---------------------------------------------
    // Validate required fields
    // ---------------------------------------------

    if (
      !specialization ||
      !qualification ||
      !registrationNumber ||
      experience === undefined ||
      experience === null ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required professional information is missing",
      });
    }

    // ---------------------------------------------
    // Check existing doctor profile
    // ---------------------------------------------

    const existingProfile =
      await DoctorProfile.findOne({
        user: userId,
      });

    if (existingProfile) {
      return res.status(200).json({
        success: true,
        message: "Doctor profile already exists",
        profile: existingProfile,
      });
    }

    // ---------------------------------------------
    // Check registration number
    // ---------------------------------------------

    const registrationExists =
      await DoctorProfile.findOne({
        registrationNumber:
          registrationNumber.trim(),
      });

    if (registrationExists) {
      return res.status(409).json({
        success: false,
        message:
          "Registration number already exists",
      });
    }

    // ---------------------------------------------
    // Create profile
    // ---------------------------------------------

    const profile =
      await DoctorProfile.create({
        user: userId,

        specialization:
          specialization.trim(),

        qualification:
          qualification.trim(),

        registrationNumber:
          registrationNumber.trim(),

        experience:
          Number(experience),

        hospital:
          hospital?.trim() || "",

        clinic:
          clinic?.trim() || "",

        city:
          city.trim(),

        address:
          address?.trim() || "",

        consultationFee:
          Number(consultationFee) || 0,

        languages:
          Array.isArray(languages)
            ? languages
            : [],

        consultationModes:
          Array.isArray(consultationModes) &&
          consultationModes.length > 0
            ? consultationModes
            : ["text"],

        bio:
          bio?.trim() || "",

        profileImage:
          profileImage || "",

        verificationStatus:
          "pending",

        isAvailable:
          false,

        availability: [],
      });

    // ---------------------------------------------
    // Return populated profile
    // ---------------------------------------------

    const populatedProfile =
      await DoctorProfile.findById(
        profile._id
      ).populate(
        "user",
        "fullName email gender age role"
      );

    return res.status(201).json({
      success: true,

      message:
        "Doctor profile submitted for verification",

      profile: populatedProfile,
    });
  } catch (error) {
    console.error(
      "CREATE DOCTOR PROFILE ERROR:",
      error
    );

    // Duplicate MongoDB key
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Doctor profile or registration number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create doctor profile",
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
    const userId = req.user._id;

    console.log(
      "GET DOCTOR PROFILE USER:",
      userId
    );

    const profile =
      await DoctorProfile.findOne({
        user: userId,
      }).populate(
        "user",
        "fullName email gender age role"
      );

    if (!profile) {
      console.log(
        "DOCTOR PROFILE NOT FOUND FOR:",
        userId
      );

      return res.status(404).json({
        success: false,
        message:
          "Doctor profile not found",
      });
    }

    console.log(
      "DOCTOR PROFILE FOUND:",
      profile._id
    );

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
      message:
        "Failed to fetch doctor profile",
      error: error.message,
    });
  }
}

// =====================================================
// UPDATE DOCTOR AVAILABILITY
// PUT /api/doctors/availability
// =====================================================

async function updateAvailability(req, res) {
  try {
    const {
      availability,
      isAvailable,
    } = req.body;

    const profile =
      await DoctorProfile.findOne({
        user: req.user._id,
      });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message:
          "Doctor profile not found",
      });
    }

    profile.availability =
      Array.isArray(availability)
        ? availability
        : [];

    profile.isAvailable =
      Boolean(isAvailable);

    await profile.save();

    return res.status(200).json({
      success: true,

      message:
        "Availability updated",

      availability:
        profile.availability,

      isAvailable:
        profile.isAvailable,
    });
  } catch (error) {
    console.error(
      "UPDATE AVAILABILITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update availability",
      error: error.message,
    });
  }
}

// =====================================================
// GET VERIFIED DOCTORS
// GET /api/doctors
// =====================================================

async function getDoctors(req, res) {
  try {
    const {
      city,
      specialization,
      mode,
    } = req.query;

    const query = {
      verificationStatus: "verified",
      isAvailable: true,
    };

    if (city) {
      query.city =
        new RegExp(city, "i");
    }

    if (specialization) {
      query.specialization =
        new RegExp(
          specialization,
          "i"
        );
    }

    if (mode) {
      query.consultationModes =
        mode;
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

      count:
        doctors.length,

      doctors,
    });
  } catch (error) {
    console.error(
      "GET DOCTORS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch doctors",
      error: error.message,
    });
  }
}

// =====================================================
// GET DOCTOR BY PROFILE ID
// GET /api/doctors/:id
// =====================================================

async function getDoctorById(req, res) {
  try {
    const { id } =
      req.params;

    const doctor =
      await DoctorProfile.findOne({
        _id: id,

        verificationStatus:
          "verified",
      }).populate(
        "user",
        "fullName email"
      );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message:
          "Doctor not found",
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
      message:
        "Failed to fetch doctor",
      error: error.message,
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