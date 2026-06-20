const express = require("express");

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
getCustomers,
getCustomerHistory,
} = require("../controllers/customerController");

router.get("/", protect, admin, getCustomers);

router.get("/:email", protect, admin, getCustomerHistory);

module.exports = router;
