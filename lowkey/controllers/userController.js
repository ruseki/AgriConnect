//userController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");
//const resetToken = require("../models/resetToken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/email");
/*const sendError = require('../utils/sendError');*/
const crypto = require('crypto');

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log(email, password);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await new Token({ owner: user._id, token }).save

        return res.status(200).json({
            message: 'Login successful',
            token,
            userType: user.userType,
            skills: user.skills || [],
            health_conditions: user.health_conditions || []
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.createUser = async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) return sendError(res, "This email is already existed");

    const newUser = new User({
        name,
        email,
        password,
    });

    let verification = '';
    const generateOTP = () => {
        for (let i = 0; i < 4; i++) {
            const randomValue = Math.floor(Math.random() * 10);
            verification += randomValue;
        }
        return verification;
    };

    const otp = generateOTP();
    newUser.otp = otp;
    newUser.otpExpires = Date.now() + 3600000; 

    await newUser.save();

    await sendEmail(email, "AgriConnect OTP", `Your OTP code is ${otp}. Expires in 1 hour.`);

    res.send({ message: "Check your mail for email verification. Thank you!" });
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return sendError(res, "User not found");

    if (user.otp !== otp) return sendError(res, "Invalid OTP");
    if (user.otpExpires < Date.now()) return sendError(res, "OTP has expired");

    user.isActive = true; 
    user.otp = undefined; 
    user.otpExpires = undefined; 
    await user.save();

    res.send({ message: "User verified successfully!" });
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;
    if (!email.trim() || !password.trim())
        return sendError(res, "email/password missing");

    const user = await User.findOne({ email });
    if (!user) return sendError(res, "User not found");
    if (!user.isActive) return sendError(res, "User account is not active");

    if (user.password !== password) return sendError(res, "Invalid password");

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
    });

    res.send({ token });
};


