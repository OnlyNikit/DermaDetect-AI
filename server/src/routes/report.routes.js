const express = require("express");

const router = express.Router();

const reporController =require("../contollers/report.controller")
//! reports routes

router.post("/upload",reporController.upload);

router.post("/analyze",reporController.analyze);

router.get("/history",reporController.history)
router.get("/:id",reporController.report)

router.delete("/:id",reporController.deleteReport);

module.exports=router;