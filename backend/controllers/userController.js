const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res) => {

    try {

        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Please fill all the fields"
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {

            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user'
        });

        const token = generateToken(user._id);

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

    }
    catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {

            const token = generateToken(user._id);

            res.cookie("jwt", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });

        }
        else {

            res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });

        }

    }
    catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

const logoutUser = async (req, res) => {

    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });

};

const getCurrentUser = async (req, res) => {

  res.status(200).json({
    success: true,
    user: req.user,
  });

};
module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser
}