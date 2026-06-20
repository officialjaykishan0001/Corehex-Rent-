const express = require("express");

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getOverview,
  getTrends,
  getCategoryPerformance,
  getMostRented,
} = require("../controllers/analyticsController");

router.get("/overview", protect, admin,getOverview);

router.get("/trends", protect, admin,getTrends);

router.get("/category-performance", protect, admin,getCategoryPerformance);

router.get("/most-rented", protect, admin,getMostRented);

module.exports = router;