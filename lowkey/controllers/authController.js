//authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const ResetToken = require('../models/tokens/reset_token');
const VerificationToken = require('../models/tokens/verification_token'); 
const nodemailer = require('nodemailer');
const Token = require('../models/tokens/login_state_token');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;


const registerUser = async (req, res) => {
    console.log(req.body)
    const { first_name, middle_name, last_name, email, password, confirm_password, birthDate } = req.body;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format." });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ message: "Password and confirm password do not match." });
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists." });
        }

        const newUser = new User({
            first_name,
            middle_name,
            last_name,
            email,
            password,
            plain_text_password: password,
            birthDate,
            userType: 'user',
            isAdmin: email === 'admin@rioasisland.cloud' ? true : false 
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        console.log('Hashed password:', newUser.password);

        const verificationCode = crypto.randomBytes(16).toString('hex');
        newUser.verificationCode = verificationCode;
        console.log(`Generated verification code for ${email}: ${verificationCode}`);

        await newUser.save();
        console.log(`Saved user: ${newUser}`);

        await sendEmail(email, 'Email Verification', `Please use the following code to verify your email: ${verificationCode}`);

        return res.status(200).json({ message: 'User registered successfully. A verification email has been sent.' });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const login = async (req, res) => {
    console.log('logging in..')
    const { email, password } = req.body;

    console.log('Login attempt:', { email, password });

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (user) {
            if (password !== user.plain_text_password) {
                console.log('Invalid password for user:', email);
                return res.status(400).json({ message: "Invalid email or password." });
            }

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log('Login successful for user:', { email, token });

            const tokenDocument = new Token({ owner: user._id, token });
            await tokenDocument.save();

            return res.status(200).json({
                message: "Login successful",
                token,
                userId: user._id,
                message: "Login successful",
                token,
                userType: user.userType,
                isVerified: user.isVerified,
                isAdmin: user.isAdmin 
            });
        }

        return res.status(400).json({ message: "Invalid email or password." });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const sendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        console.log('Request Body:', req.body); 
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(404).json({ message: 'User not found.' });
        }

        const code = crypto.randomBytes(16).toString('hex'); 
        user.verificationCode = code; 
        await user.save();

        console.log('Generated Verification Code:', code);

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification',
            text: `Please use the following code to verify your email: ${code}`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Verification email sent successfully.' });
    } catch (error) {
        console.error('Error in sendVerificationEmail:', error);
        res.status(500).json({ message: 'Error sending verification email.' });
    }
};



const verifyEmail = async (req, res) => {
    const { email, token: inputCode } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found for email:', email); 
        return res.status(404).json({ message: 'User not found.' });
      }
  
      console.log('Received Code:', inputCode); 
      console.log('Stored Code:', user.verificationCode); 
  
      if (!user.verificationCode || user.verificationCode !== inputCode) {
        return res.status(400).json({ message: 'Invalid or expired verification code.' });
      }
  
      user.isVerified = true;
      user.verificationCode = undefined; 
      await user.save();
  
      res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
      console.error('Error in verifyEmail:', error.message); 
      res.status(500).json({ message: 'Error verifying email.', error: error.message });
    }
  };
  



  
  
  exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
  
    console.log('Received OTP:', otp);  
    console.log('Stored OTP:', user.otp);  
  
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < Date.now()) return res.status(400).json({ message: "OTP has expired" });
  
    user.isActive = true; 
    user.otp = undefined; 
    user.otpExpires = undefined; 
    await user.save();
  
    res.status(200).json({ message: "User verified successfully!" });
  };
  
  


  const forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Remove existing tokens for the user
      await ResetToken.deleteMany({ owner: user._id });
  
      // Create a new reset token
      const token = crypto.randomBytes(32).toString('hex');
      const resetToken = new ResetToken({ owner: user._id, token });
      await resetToken.save();
  
      // Log userId and token for debugging
      console.log(`Password Reset Request: 
      - User ID: ${user._id}
      - Reset Token: ${token}`);
  
      // Generate reset link
      const resetLink = `http://localhost:3000/reset-password?token=${encodeURIComponent(token)}&id=${user._id}`;
  
      // Send email with the reset link
      await sendEmail(
        user.email,
        'Password Reset Request',
        `Please use the following link to reset your password: ${resetLink}`
      );
  
      return res.status(200).json({
        message: 'The password reset link has been sent to your email. Please check your spam folder.',
      });
    } catch (error) {
      console.error('Error in forgotPassword:', error.message);
      res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
  };


const resendVerificationCode = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const verificationCode = crypto.randomBytes(16).toString('hex');
        user.verificationCode = verificationCode;
        await user.save();

        await sendEmail(user.email, 'Email Verification', `Please use the following code to verify your email: ${verificationCode}`);
        
        return res.status(200).json({ message: 'Verification code resent successfully' });
    } catch (error) {
        console.error('Error resending verification code:', error);
        res.status(500).json({ message: 'Error resending verification code' });
    }
};

module.exports = { resendVerificationCode };

const resetPassword = async (req, res) => {
    const { token, userId, newPassword } = req.body;
    try {
        const resetToken = await ResetToken.findOne({ owner: userId });
        if (!resetToken) {
            return res.status(400).json({ message: "Invalid or expired password reset token" });
        }

        if (resetToken.token !== token) {
            return res.status(400).json({ message: "Invalid or expired password reset token" });
        }

        const user = await User.findById(userId);
        if (user) {
            user.password = await bcrypt.hash(newPassword, 10);
            user.plain_text_password = newPassword;
            await user.save();
            await ResetToken.deleteOne({ owner: userId });

            return res.status(200).json({ message: "Password reset successful" });
        }

        return res.status(404).json({ message: "User not found." });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getUser = async (req, res) => {
    const userId  = req.userId;

    try {
        console.log(userId)
        console.log('getting user')
        const user = await User.findById(userId);
        console.log(user)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        return res.status(200).json(
            user
        );
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { login, registerUser, sendVerificationEmail, verifyEmail, forgotPassword, resetPassword, resendVerificationCode, getUser };