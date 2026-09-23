const DoctorProfile = require("../models/doctorProfile");
const User = require("../models/user");

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
      });
    }

    const registrationExists =
      await DoctorProfile.findOne({
        registrationNumber,
      });

    if (registrationExists) {
      return res.status(409).json({
        success: false,
        message: "Registration number already exists",
      });
    }

    const profile = await DoctorProfile.create({
      user: req.user._id,
      specialization,
      qualification,
      registrationNumber,
      experience,
      hospital,
      clinic,
      city,
      address,
      consultationFee: consultationFee || 0,
      languages: languages || [],
      consultationModes:
        consultationModes || ["text"],
      bio: bio || "",
      profileImage: profileImage || "",
      verificationStatus: "pending",
    });

    return res.status(201).json({
      success: true,
      message:
        "Doctor profile submitted for verification",
      profile,
    });
  } catch (error) {
    console.error("CREATE DOCTOR PROFILE:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create doctor profile",
      error: error.message,
    });
  }
}

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
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor profile",
    });
  }
}

async function updateAvailability(req, res) {
  try {
    const { availability, isAvailable } = req.body;

    const profile = await DoctorProfile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    profile.availability = availability || [];
    profile.isAvailable = Boolean(isAvailable);

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Availability updated",
      availability: profile.availability,
      isAvailable: profile.isAvailable,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update availability",
    });
  }
}

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
      query.city = new RegExp(city, "i");
    }

    if (specialization) {
      query.specialization = new RegExp(
        specialization,
        "i"
      );
    }

    if (mode) {
      query.consultationModes = mode;
    }

    const doctors = await DoctorProfile.find(query)
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
    console.error("GET DOCTORS:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
}

async function getDoctorById(req, res) {
  try {
    const { id } = req.params;

    const doctor = await DoctorProfile.findOne({
      _id: id,
      verificationStatus: "verified",
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
    console.error(error);

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