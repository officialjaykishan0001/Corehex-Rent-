const Booking = require("../models/bookingModel");
const Notification = require("../models/notificationModel");

const createBooking = async (req, res) => {
  try {

    const booking = await Booking.create(req.body);

    await Notification.create({
      kind: "booking",
      title: "New booking request",
      message: `${booking.name} • ${booking.company} requested ${booking.quantity}x equipment`,
      href: `/admin/bookings/${booking._id}`,
    });

    res.status(201).json({
      success: true,
      id: booking._id,
      estimatedCost: booking.estimatedCost,
      data: booking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const getBookings = async (req, res) => {

  try {

    const bookings = await Booking.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

const getBookingById = async (req, res) => {

  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {

      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });

    }

    res.status(200).json({
      success: true,
      data: booking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

const updateBookingStatus = async (req, res) => {

  try {

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
        new: true,
      }
    );

    if (!booking) {

      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });

    }

    res.status(200).json({
      success: true,
      data: booking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

const deleteBooking = async (req, res) => {

  try {

    const booking = await Booking.findByIdAndDelete(
      req.params.id
    );

    if (!booking) {

      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });

    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};