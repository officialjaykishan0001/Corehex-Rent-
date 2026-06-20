const express = require("express");

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getInventorySummary,
  getInventoryItems,
} = require("../controllers/inventoryController");

router.get("/summary", protect, admin, getInventorySummary);

router.get("/", protect, admin, getInventoryItems);

module.exports = router;