const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const DeleteRequest = require("../models/deleteRequestModel");
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
    const { name, email, password, deviceId, deviceType, pushToken } = req.body;

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
      devices: deviceId ? [{ deviceId, deviceType, pushToken, lastActive: new Date() }] : []
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

/* ================= UPDATE DEVICE ================= */
exports.updateDevice = async (req, res) => {
  try {
    const { deviceId, deviceType, pushToken } = req.body;
    const userId = req.userId; // From JWT middleware

    if (!deviceId) return res.status(400).json({ message: "deviceId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const deviceIndex = user.devices.findIndex(d => d.deviceId === deviceId);
    if (deviceIndex > -1) {
      user.devices[deviceIndex].pushToken = pushToken || user.devices[deviceIndex].pushToken;
      user.devices[deviceIndex].deviceType = deviceType || user.devices[deviceIndex].deviceType;
      user.devices[deviceIndex].lastActive = new Date();
    } else {
      user.devices.push({ deviceId, deviceType, pushToken, lastActive: new Date() });
    }

    await user.save();
    res.json({ success: true, message: "Device updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        deviceId: user.deviceId,
        deviceType: user.deviceType,
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
    const { email, password, deviceId, deviceType, pushToken } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }
    const user = await User.findOne({ email: email });

    if (!user) return res.status(400).json({ message: "User not found" });
    const valid = await bcrypt.compare(password, user.password);
  
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
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        },
      });
    }

    // Update or Add device info on login
    if (deviceId) {
      const deviceIndex = user.devices.findIndex(d => d.deviceId === deviceId);
      if (deviceIndex > -1) {
        // Update existing device
        user.devices[deviceIndex].pushToken = pushToken || user.devices[deviceIndex].pushToken;
        user.devices[deviceIndex].deviceType = deviceType || user.devices[deviceIndex].deviceType;
        user.devices[deviceIndex].lastActive = new Date();
      } else {
        // Add new device
        user.devices.push({ deviceId, deviceType, pushToken, lastActive: new Date() });
      }
      await user.save();
    }

    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        devices: user.devices // Returning full devices list for push management
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

/* ================= DELETE ACCOUNT ================= */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId; // From JWT middleware
    console.log('[DeleteAccount] Attempting deletion for UserID:', userId);
    
    if (!userId) {
      console.error('[DeleteAccount] Error: No userId found in request');
      return res.status(401).json({ message: "Unauthorized: No user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
       console.error('[DeleteAccount] Error: User not found for ID:', userId);
       return res.status(404).json({ message: "User not found" });
    }

    console.log('[DeleteAccount] Found user:', user.email);
    await User.findByIdAndDelete(userId);
    console.log('[DeleteAccount] Successfully deleted user:', userId);

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete Account error:", err);
    res.status(500).json({ message: "Failed to delete account: " + err.message });
  }
};

/**
 * Request account deletion
 */
exports.requestDeleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { reason } = req.body;

    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    // Check if a pending request already exists
    const existingRequest = await DeleteRequest.findOne({ userId, status: "pending" });
    if (existingRequest) {
      return res.status(400).json({ 
        status: "error", 
        message: "You already have a pending deletion request." 
      });
    }

    // Create new request
    const newRequest = new DeleteRequest({
      userId,
      reason: reason || "No reason provided",
      status: "pending"
    });

    await newRequest.save();

    console.log(`[DELETE_REQUEST] User ${userId} requested account deletion.`);

    res.status(201).json({ 
      status: "success", 
      message: "Your deletion request has been submitted to the admin." 
    });
  } catch (error) {
    console.error("[REQUEST_DELETE_ERROR]", error);
    res.status(500).json({ status: "error", message: "Failed to submit deletion request" });
  }
};

/**
 * Request account deletion via email (for website)
 */
exports.requestDeleteAccountByEmail = async (req, res) => {
  try {
    const { email, reason } = req.body;
    console.log("[DEBUG_WEB_DELETE] Email:", email, "Reason:", reason);

    if (!email) {
      req.session.flash = { type: "error", message: "Email is required." };
      return res.redirect("/delete-request");
    }

    const user = await User.findOne({ email });
    console.log("[DEBUG_WEB_DELETE] User found:", user ? user._id : "None");

    if (!user) {
      req.session.flash = { 
        type: "error", 
        message: "No account found with this email address." 
      };
      // Sticky data
      req.session.formData = { email, reason };
      return res.redirect("/delete-request");
    }

    // Check if a pending request already exists
    const existingRequest = await DeleteRequest.findOne({ userId: user._id, status: "pending" });
    console.log("[DEBUG_WEB_DELETE] Existing request:", existingRequest ? existingRequest._id : "None");

    if (existingRequest) {
      req.session.flash = { 
        type: "error", 
        message: "A pending deletion request already exists for this account." 
      };
      return res.redirect("/delete-request");
    }

    // Create new request
    const newRequest = new DeleteRequest({
      userId: user._id,
      reason: reason || "Web request (no reason provided)",
      status: "pending"
    });

    console.log("[DEBUG_WEB_DELETE] Saving new request for user:", user._id);
    await newRequest.save();

    console.log(`[WEB_DELETE_REQUEST] User ${user._id} (${email}) requested account deletion via web.`);

    req.session.flash = { 
      type: "success", 
      message: "Your deletion request has been submitted successfully. Our team will review it shortly." 
    };
    res.redirect("/delete-request");
  } catch (error) {
    console.error("[WEB_REQUEST_DELETE_ERROR]", error);
    req.session.flash = { type: "error", message: "Failed to submit request. Please try again later." };
    res.redirect("/delete-request");
  }
};


