const User = require("../models/user");

function getProfile(req, res) {
  res.status(200).json({ success: true, message: "Profile fetched successfully", user: req.user });
}

// legacy alias some routes might still point to
function profile(req, res) {
  return getProfile(req, res);
}

async function profileUpdate(req, res) {
  try {
    const { fullName, name, age, gender, email, phone } = req.body;
    // frontend dashboard sends "name", your schema uses "fullName" - accept either
    const updates = {};
    if (fullName || name) updates.fullName = fullName || name;
    if (age !== undefined) updates.age = age;
    if (gender) updates.gender = gender;
    if (email) updates.email = email;
    if (phone !== undefined) updates.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Profile update failed:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
}

async function profileDelete(req, res) {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.clearCookie("token");
    return res.status(200).json({ success: true, message: "Profile deleted" });
  } catch (err) {
    console.error("Profile delete failed:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { profile, profileUpdate, profileDelete, getProfile };