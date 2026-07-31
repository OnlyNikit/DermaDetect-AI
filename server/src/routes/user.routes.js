

const express = require("express");

const router = express.Router();


const userController= require("../contollers/user.controller")

//! user profile routes

router.get("/profile",userController.profile);
router.post("/profile",userController.profileUpdate);
router.delete("/profile",userController.profileDelete);

module.exports=router;