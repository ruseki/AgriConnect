const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const ResetToken = require('../models/tokens/reset_token');
const VerificationToken = require('../models/tokens/verification_token'); // Use correct model name
const nodemailer = require('nodemailer');
const Token = require('../models/tokens/login_state_token');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;


const registerUser = async (req, res) => {
    const { first_name, middle_name, last_name, email, password, confirm_password } = req.body;

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
            userType: 'user'
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

            // store token in database
            const tokenDocument = new Token({ owner: user._id, token });
            await tokenDocument.save();

            return res.status(200).json({
                message: "Login successful",
                token,
                userType: user.userType,
                isVerified: user.isVerified
            });
        }

        return res.status(400).json({ message: "Invalid email or password." });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// removed the verify email every log in 

const sendVerificationEmail = async (req, res) => {
    const { email } = req.user;
    const code = crypto.randomBytes(16).toString('hex');
  
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
  
    try {
      const token = new VerificationToken({
        owner: req.userId,
        token: code,  // Store plain text token
      });
  
      console.log('Verification Token:', token.token);
      console.log('Verification Token Owner:', token.owner);
  
      await token.save();
      await transporter.sendMail(mailOptions);
  
      res.json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Error sending email' });
    }
  };
  
  
  
  exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
  
    console.log('Received OTP:', otp);  // Add this line
    console.log('Stored OTP:', user.otp);  // Add this line
  
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < Date.now()) return res.status(400).json({ message: "OTP has expired" });
  
    user.isActive = true; 
    user.otp = undefined; 
    user.otpExpires = undefined; 
    await user.save();
  
    res.status(200).json({ message: "User verified successfully!" });
  };
  

  const verifyEmail = async (req, res) => {
    const { email, token: inputToken } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found for email:', email);
        return res.status(404).json({ message: 'User not found' });
      }
  
      const verificationToken = await VerificationToken.findOne({ owner: user._id });
      console.log('Received Token:', inputToken);
      console.log('Stored Token:', verificationToken ? verificationToken.token : 'No Token Found');
  
      if (!verificationToken || !verificationToken.compareToken(inputToken)) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }
  
      user.isVerified = true;
      await user.save();
      await VerificationToken.deleteOne({ owner: user._id });
  
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({ message: 'Error verifying email' });
    }
  };
  
  


const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            await ResetToken.deleteMany({ owner: user._id });

            const token = crypto.randomBytes(32).toString('hex');
            console.log('Generated token for user:', token);

            const resetToken = new ResetToken({
                owner: user._id,
                token: token  
            });

            await resetToken.save();
            console.log('Reset token saved for user:', resetToken);

            const resetLink = `http://localhost:3000/reset-password?token=${encodeURIComponent(token)}&id=${user._id}`;
            await sendEmail(user.email, `Password Reset Request`, `Please use the following link to reset your password: ${resetLink}`);

            return res.status(200).json({ message: "The password reset link is sent to your email. Please check your spam folder." });
        }

        const employer = await Employer.findOne({ organization_email: email });
        if (employer) {
            await ResetToken.deleteMany({ owner: employer._id });

            const token = crypto.randomBytes(32).toString('hex');
            console.log('Generated token for employer:', token);

            const resetToken = new ResetToken({
                owner: employer._id,
                token: token  
            });

            await resetToken.save();
            console.log('Reset token saved for employer:', resetToken);

            const resetLink = `http://localhost:3000/reset-password?token=${encodeURIComponent(token)}&id=${employer._id}`;
            await sendEmail(employer.organization_email, `Password Reset Request`, `Please use the following link to reset your password: ${resetLink}`);

            return res.status(200).json({ message: "The password reset link is sent to your email. Please check your spam folder." });
        }

        return res.status(404).json({ message: "Cannot find the user or employer." });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ message: "Error. Please come back later", error: error.message });
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
        console.log('Reset password attempt:', { token, userId });

        const resetToken = await ResetToken.findOne({ owner: userId });
        if (!resetToken) {
            console.log('No reset token found for user:', userId);
            return res.status(400).json({ message: "Invalid or expired password reset token" });
        }

        console.log('Stored token:', resetToken.token);

        if (resetToken.token !== token) {
            console.log('Invalid or expired password reset token:', { token, userId });
            return res.status(400).json({ message: "Invalid or expired password reset token" });
        }

        const user = await User.findById(userId);
        if (user) {
            console.log('User found for password reset:', user);

            user.password = await bcrypt.hash(newPassword, 10);
            user.plain_text_password = newPassword;  
            await user.save();
            console.log('Password updated for user:', user);

            await ResetToken.deleteOne({ owner: userId });
            console.log('Reset token deleted for user:', userId);

            return res.status(200).json({ message: "Password reset successful" });
        }

        const employer = await Employer.findById(userId);
        if (employer) {
            console.log('Employer found for password reset:', employer);

            employer.password = await bcrypt.hash(newPassword, 10);
            employer.plain_text_password = newPassword;  // temporary lang 'to ha
            await employer.save();
            console.log('Password updated for employer:', employer);

            await ResetToken.deleteOne({ owner: userId });
            console.log('Reset token deleted for employer:', userId);

            return res.status(200).json({ message: "Password reset successful" });
        }

        return res.status(404).json({ message: "Cannot find the user or employer." });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getUser = async (req, res) => {
    const { userId } = req;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            email: user.email,
            isVerified: user.isVerified,
            userType: user.userType
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = { login, registerUser, sendVerificationEmail, verifyEmail, forgotPassword, resetPassword, resendVerificationCode, getUser}; /* idadagdag ko ung ForgotPasword */
