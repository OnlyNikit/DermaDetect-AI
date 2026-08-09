const express = require("express");

const router = express.Router();

const authController = require("../contollers/auth.controller");
const authMiddleware = require("../middlewares/auth");

// ! authentication routes

router.post("/login", authController.login);

router.post("/register",  authController.register);
router.post("/logout",  authController.logout);

module.exports = router;
