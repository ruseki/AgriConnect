/* controllers/userController.js */

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

        await new Token({ owner: user._id, token }).save();

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
    const { 
        first_name, 
        middle_name, 
        last_name, 
        email, 
        password, 
        birthDate, 
        country = 'Philippines', 
        province, 
        cityOrTown, 
        barangay, 
        bio 
    } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'This email is already registered.' });
    }

    try {
        const newUser = new User({
            first_name,
            middle_name,
            last_name,
            email,
            password,
            plain_text_password: password, 
            birthDate,
            country,
            province,
            cityOrTown,
            barangay,
            bio 
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
        newUser.otpExpires = Date.now() + 3600000; // 1 hour

        await newUser.save();
        await sendEmail(email, 'AgriConnect OTP', `Your OTP code is ${otp}. Expires in 1 hour.`);

        res.status(200).json({ message: 'Check your email for OTP verification!' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error. Could not create user.' });
    }
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

exports.updateSellerStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
    
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
    
        user.isSeller = req.body.isSeller; 
        await user.save();
    
        res.status(200).json({ message: 'Seller status updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating seller status', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const { country, province, cityOrTown, barangay, bio, ...rest } = req.body;
  
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        Object.assign(user, {
            ...rest,
            country: country || user.country,
            province: province || user.province,
            cityOrTown: cityOrTown || user.cityOrTown,
            barangay: barangay || user.barangay,
            bio: bio || user.bio, 
        });

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error. Could not update user.' });
    }
};