const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser
} = require("../controllers/userController");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", protect, logoutUser);

router.get("/me", protect, getCurrentUser);

module.exports = router;