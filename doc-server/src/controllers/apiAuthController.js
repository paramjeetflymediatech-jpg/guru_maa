const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const { sendOtpEmail } = require("../utils/mailer");
const { JWT_SECRET } = require("../config/config");

/* ================= HELPERS ================= */
const createToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ================= REGISTER ================= */

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const otp = generateOtp();

    // Store plain password here and let the Mongoose pre-save hook hash it once
    const user = await User.create({
      name,
      email,
      password,
      otp,
      isVerified: false,
    });

    // send OTP email
    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent to your email",
      userId: user._id,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* ================= RESEND OTP ================= */
exports.resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    user.otp = otp;
    await user.save();

    // send OTP email
    await sendOtpEmail(user.email, otp);

    res.json({ success: true, message: "OTP resent to your email" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

/* ================= VERIFY OTP ================= */
exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "OTP required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    user.isVerified = true;
    user.otp = null;
    await user.save();
    const token = createToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }
    const user = await User.findOne({ email: email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    console.log(password, "user", user);
    const valid = await bcrypt.compare(password, user.password);
    console.log(valid, "ddd");
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.isVerified) {
      const otp = generateOtp();
      user.otp = otp;
      await user.save();
      await sendOtpEmail(email, otp);
      return res.status(200).json({
        message: "OTP verification required",
        user: {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified,
        },
      });
    }
    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ================= FORGOT PASSWORD ================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    user.otp = otp;
    await user.save();
    console.log(user);
    // send OTP email
    await sendOtpEmail(email, otp);
    res.json({
      success: true,
      message: "OTP sent to your email",
      userId: user._id,
    });
  } catch (err) {
    console.error("Forgot Password error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email && !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.password = newPassword;
    user.otp = null; // clear OTP after reset
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password error:", err);
    res.status(500).json({ message: "Password reset failed" });
  }
};
