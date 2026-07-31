
const express = require("express");

const router = express.Router();

const pdfController = require("../contollers/pdf.controller")

//! pdf
router.get("/:id", pdfController.pdf);

module.exports=router;