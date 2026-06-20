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

router.post("/", protect, admin, createBooking);

router.get("/", getBookings);

router.get("/:id", getBookingById);

router.patch("/:id", protect, admin, updateBookingStatus);

router.delete("/:id", protect, admin, deleteBooking);

module.exports = router;