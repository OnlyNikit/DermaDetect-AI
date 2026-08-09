const Report = require("../models/report");

// GET /api/report
async function getReports(req, res) {
  try {
    const raw = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
    const reports = raw.map((r) => ({
      id: r._id,
      title: r.title,
      date: r.createdAt,
    }));
    return res.status(200).json({ success: true, reports });
  } catch (err) {
    console.error("Get reports failed:", err);
    return res.status(500).json({ success: false, message: "Could not load reports" });
  }
}

// GET /api/report/:id/download
async function downloadReport(req, res) {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
    if (!report || !report.fileUrl) {
      return res.status(404).json({ success: false, message: "Report file not found" });
    }
    return res.redirect(report.fileUrl);
  } catch (err) {
    console.error("Download report failed:", err);
    return res.status(500).json({ success: false, message: "Could not download report" });
  }
}

// DELETE /api/report/:id
async function deleteReport(req, res) {
  try {
    const deleted = await Report.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    return res.status(200).json({ success: true, message: "Report deleted" });
  } catch (err) {
    console.error("Delete report failed:", err);
    return res.status(500).json({ success: false, message: "Could not delete report" });
  }
}

module.exports = { getReports, downloadReport, deleteReport };