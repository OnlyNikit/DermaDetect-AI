const express = require("express");

const router = express.Router();

const authController = require("../contollers/auth.controller")

// ! authentication routes

router.post("/login",authController.login);

router.post("/register",authController.register);

module.exports=router;