const express = require("express");

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
    createQuote,
    getQuotes,
    getQuoteById,
    updateQuoteStatus,
} = require("../controllers/quoteController");

router.post("/", createQuote);

router.get("/", protect, admin, getQuotes);

router.get("/:id", protect, admin, getQuoteById);

router.patch("/:id", protect, admin, updateQuoteStatus);

module.exports = router;
