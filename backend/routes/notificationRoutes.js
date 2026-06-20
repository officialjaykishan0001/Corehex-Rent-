const express = require("express");

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} = require("../controllers/notificationController");

router.get("/", protect, admin, getNotifications);

router.get("/unread-count", protect, admin, getUnreadCount);

router.patch("/read-all", protect, admin, markAllRead);

router.patch("/:id", protect, admin, markRead);

module.exports = router;