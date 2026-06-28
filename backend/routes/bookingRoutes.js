const express = require("express");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const router = express.Router();

const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/bookingController");

router.post("/", protect, createBooking);

router.get("/", protect, getBookings);

router.get("/:id", protect, getBookingById);

router.patch("/:id", protect, admin, updateBookingStatus);

router.delete("/:id", protect, deleteBooking);

module.exports = router;