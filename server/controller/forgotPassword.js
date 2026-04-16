require("dotenv").config();
const User = require("../models/user_model");
const bcrypt = require("bcrypt");
const resend = require("../config/mailer");
const logger = require("../utils/logger");
const crypto = require("crypto");

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    console.log(`\n--- sendOTP called for email: ${email} ---`);

    const user = await User.findOne({ email });
    if (!user) {
      // We return success anyway to not reveal if email exists
      console.log(`User not found for email: ${email}`);
      return res.status(200).json({ message: "If this email exists, an OTP has been sent." });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Console log for testing
    console.log(`OTP Generated for ${email}: ${otp}`);
    console.log(`OTP expires at: ${expiry.toLocaleString()}\n`);

    // Save OTP and expiry to user
    user.reset_otp = otp;
    user.reset_otp_expiry = expiry;
    await user.save();

    // Send email using Resend
    try {
      const emailResponse = await resend.emails.send({
        from: "Password Reset <onboarding@resend.dev>",
        to: email,
        subject: "Your Password Reset OTP",
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
            <h2>Password Reset</h2>
            <p>Your OTP code is:</p>
            <h1 style="letter-spacing: 8px; color: #A1A2A6;">${otp}</h1>
            <p>This code expires in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, ignore this email.</p>
          </div>
        `,
      });
      console.log(`Email sent successfully to ${email}:`, emailResponse);
    } catch (emailError) {
      console.log(`Email sending failed (but OTP is generated - use it for testing):`);
      console.log(`   Error: ${emailError.message}`);
      console.log(`   Tip: Check if RESEND_API_KEY is set in .env\n`);
    }

    logger.info({
      message: `FORGOT PASSWORD -- OTP sent to ${email}`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json({ message: "If this email exists, an OTP has been sent." });
  } catch (error) {
    console.error(`OTP Generation Error: ${error.message}`);
    logger.error({
      message: `FORGOT PASSWORD SEND OTP -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.reset_otp || !user.reset_otp_expiry) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Check expiry
    if (new Date() > user.reset_otp_expiry) {
      user.reset_otp = null;
      user.reset_otp_expiry = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Check OTP match
    if (user.reset_otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    logger.info({
      message: `FORGOT PASSWORD -- OTP verified for ${email}`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    logger.error({
      message: `FORGOT PASSWORD VERIFY OTP -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.reset_otp || !user.reset_otp_expiry) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Re-verify OTP and expiry as a security check
    if (new Date() > user.reset_otp_expiry || user.reset_otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.hashed_password = await bcrypt.hash(new_password, salt);

    // Clear OTP fields
    user.reset_otp = null;
    user.reset_otp_expiry = null;
    await user.save();

    logger.info({
      message: `FORGOT PASSWORD -- Password reset successful for ${email}`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    logger.error({
      message: `FORGOT PASSWORD RESET -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};
