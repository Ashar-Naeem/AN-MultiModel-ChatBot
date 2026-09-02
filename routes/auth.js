const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Otp = require("../models/Otp");
const authMiddleware = require("../middleware/auth");
const { sendOtpEmail, isEmailConfigured } = require("../services/emailService");

const router = express.Router();

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "an_ai_studio_default_secret_key";
  return jwt.sign({ id: userId }, secret, { expiresIn: "30d" });
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function otpsMatch(stored, provided) {
  const a = Buffer.from(String(stored || ""), "utf8");
  const b = Buffer.from(String(provided || ""), "utf8");
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

// @route   POST /api/auth/send-otp
// @desc    Generate and send 6-digit OTP to user's Google/email address
// @access  Public
router.post("/send-otp", async (req, res) => {
  try {
    const { email, purpose = "signup" } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email address is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (!isEmailConfigured()) {
      return res.status(503).json({
        error: "Email delivery is not set up yet. Add EMAIL_USER and EMAIL_PASS (Gmail App Password) in the server .env file, then restart the server."
      });
    }

    // If signing up, ensure account doesn't already exist
    if (purpose === "signup") {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          error: "An account with this email already exists. Please sign in instead."
        });
      }
    }

    // If logging in with OTP or resetting password, ensure account exists
    if (purpose === "login" || purpose === "reset_password") {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (!existingUser) {
        return res.status(404).json({
          error: "No account found with this email address. Please create an account first."
        });
      }
    }

    // Generate secure 6-digit OTP
    const otpCode = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Remove any previous active OTPs for this email and purpose
    await Otp.deleteMany({ email: normalizedEmail, purpose });

    // Store new OTP in database
    await Otp.create({
      email: normalizedEmail,
      otp: otpCode,
      purpose,
      verified: false,
      expiresAt
    });

    try {
      await sendOtpEmail(normalizedEmail, otpCode, purpose);
    } catch (emailError) {
      await Otp.deleteMany({ email: normalizedEmail, purpose });
      console.error("Send OTP Email Error:", emailError.message);
      return res.status(503).json({
        error: emailError.message || "Failed to send verification code to email. Please try again."
      });
    }

    return res.status(200).json({
      message: `A 6-digit verification code has been sent to ${normalizedEmail}. Check your inbox and spam folder.`,
      email: normalizedEmail,
      expiresIn: "10 minutes"
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      error: "Failed to send verification code. Please try again."
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify the 6-digit OTP entered by the user
// @access  Public
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, purpose = "signup" } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and verification code are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Find the latest active OTP for this email
    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      purpose,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        error: "Verification code has expired or was not found. Please request a new one."
      });
    }

    if (!otpsMatch(otpRecord.otp, cleanOtp)) {
      return res.status(400).json({
        error: "Invalid verification code. Please check your email and try again."
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    return res.status(200).json({
      message: "Email verified successfully!",
      verified: true,
      email: normalizedEmail
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to verify code. Please try again."
    });
  }
});

// @route   POST /api/auth/signup
// @desc    Register a new user after verifying OTP
// @access  Public
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, otp, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Please provide all required fields: name, email, and password."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        error: "An account with this email already exists. Please sign in."
      });
    }

    // Verify OTP requirement
    // Check if OTP was passed or previously verified
    let isOtpValid = false;

    if (otp) {
      const cleanOtp = otp.toString().trim();
      const otpRecord = await Otp.findOne({
        email: normalizedEmail,
        purpose: "signup",
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });

      if (otpRecord && otpsMatch(otpRecord.otp, cleanOtp)) {
        isOtpValid = true;
      }
    } else {
      // Check if previously marked as verified in the last 15 minutes
      const verifiedRecord = await Otp.findOne({
        email: normalizedEmail,
        purpose: "signup",
        verified: true,
        expiresAt: { $gt: new Date() }
      });
      if (verifiedRecord) {
        isOtpValid = true;
      }
    }

    if (!isOtpValid) {
      return res.status(400).json({
        error: "Please verify your email with the 6-digit code sent to your Google account first."
      });
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      avatar: avatar || "",
      isVerified: true
    });

    await user.save();

    // Clean up OTP records for this email
    await Otp.deleteMany({ email: normalizedEmail });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Account created and verified successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to create account. Please try again."
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter both email and password." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        error: "Account not found with this email. Please create an account first."
      });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken(user._id);

    return res.json({
      message: "Logged in successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      error: error.message || "Login failed. Please try again."
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", authMiddleware, async (req, res) => {
  try {
    return res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error("Auth Me Error:", error);
    return res.status(500).json({ error: "Failed to fetch user data." });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update profile (name / avatar)
// @access  Private
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = req.user;

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to update profile."
    });
  }
});

module.exports = router;
