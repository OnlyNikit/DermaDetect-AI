
const Assessment = require("../models/skinAssessment");
const Report = require("../models/report");

// GET /api/dashboard/stats
async function stats(req, res) {
  try {
    const totalScans = await Assessment.countDocuments({ user: req.user._id });
    const lastScan = await Assessment.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const reportsAvailable = await Report.countDocuments({ user: req.user._id });

    return res.status(200).json({
      success: true,
      stats: {
        totalScans,
        lastScanDate: lastScan?.createdAt || null,
        currentStatus: lastScan?.prediction?.disease
          ? lastScan.prediction.disease.toLowerCase() === "healthy"
            ? "Healthy"
            : "Disease Detected"
          : "Not available",
        reportsAvailable,
      },
    });
  } catch (err) {
    console.error("Dashboard stats failed:", err);
    return res.status(500).json({ success: false, message: "Could not load dashboard stats" });
  }
}

module.exports = { stats };