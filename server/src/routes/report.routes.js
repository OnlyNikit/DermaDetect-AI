const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const { getReports, downloadReport, deleteReport } = require("../contollers/report.controller");

router.get("/", authMiddleware, getReports);
router.get("/:id/download", authMiddleware, downloadReport);
router.delete("/:id", authMiddleware, deleteReport);

module.exports = router;