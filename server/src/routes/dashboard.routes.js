const express = require("express");
const router = express.Router();

const dashboardController = require("../contollers/dashboard.controller")

// ! dashboard

router.get("/stats",dashboardController.stats)


module.exports=router;