const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    equipmentSlug: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    deliveryRequired: {
      type: Boolean,
      default: false,
    },

    installationRequired: {
      type: Boolean,
      default: false,
    },

    specialRequirements: String,

    name: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    projectType: {
      type: String,
      required: true,
    },

    estimatedCost: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed"
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);