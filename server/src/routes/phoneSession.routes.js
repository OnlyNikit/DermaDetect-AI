    const express = require("express");
    const router = express.Router();

    const {createPhoneSession,getPhoneSession, uploadPhoneImage} = require("../contollers/phoneSession.controller");
    const upload =require("../middlewares/upload");

    //create qr session
    router.post("/phone-session",createPhoneSession);

    //laptop polling endpoint
    router.get( "/phone-session/:sessionId",getPhoneSession);

    //phone photo upload
    router.post("/phone-upload/:sessionId",upload.single("image"),uploadPhoneImage);

    module.exports= router;

