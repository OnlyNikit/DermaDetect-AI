const express = require("express");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

const userController = require("../contollers/user.controller");

//! user profile routes

router.get("/profile", authMiddleware, userController.getProfile);

// changed from POST to PUT - frontend dashboard calls api.put("/user/profile", profile)
router.put("/profile", authMiddleware, userController.profileUpdate);

// kept POST too, in case anything else in your app still calls it that way
router.post("/profile", authMiddleware, userController.profileUpdate);

router.delete("/profile", authMiddleware, userController.profileDelete);

module.exports = router;