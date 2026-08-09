const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const { pdf } = require("../contollers/pdf.controller");

// NOTE: pdf.controller.js is still just a stub (res.send("pdf downloaded")).
// Real PDF generation (e.g. with pdfkit or puppeteer) needs to be added
// inside pdf.controller.js when you're ready for it - route is wired either way.
router.get("/:assessmentId", authMiddleware, pdf);

module.exports = router;