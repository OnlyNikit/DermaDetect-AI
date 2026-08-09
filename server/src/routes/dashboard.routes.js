const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const { stats } = require("../contollers/dashboard.controller");

router.get("/stats", authMiddleware, stats);

module.exports = router;