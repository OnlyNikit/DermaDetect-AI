const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const { getNotifications, markRead } = require("../contollers/notification.controller");

router.get("/", authMiddleware, getNotifications);
router.patch("/:id/read", authMiddleware, markRead);

module.exports = router;