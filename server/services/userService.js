const bcrypt = require("bcrypt");
const User = require("../models/user_model");

// Helper to ensure buffer is properly converted
const ensureBufferConverted = (user) => {
  if (user && user.profile_picture?.data) {
    // Ensure it's a Buffer object
    if (!Buffer.isBuffer(user.profile_picture.data)) {
      if (typeof user.profile_picture.data === 'object' && user.profile_picture.data.type === 'Buffer') {
        // Convert from serialized format {type: 'Buffer', data: [...]}
        user.profile_picture.data = Buffer.from(user.profile_picture.data);
      } else if (typeof user.profile_picture.data === 'string') {
        // If it's already base64, convert it back to buffer then we'll handle in controller
        user.profile_picture.data = Buffer.from(user.profile_picture.data, 'base64');
      }
    }
  }
  return user;
};

// Get a user by ID
const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-hashed_password");
  return ensureBufferConverted(user);
};

// Patch only the fields that were modified
const updateUser = async (userId, updates) => {
  const patchData = {};

  // 🔄 Map frontend fields → DB fields
  if (updates.firstName !== undefined && updates.firstName !== "") {
    patchData.first_name = updates.firstName;
  }

  if (updates.lastName !== undefined && updates.lastName !== "") {
    patchData.last_name = updates.lastName;
  }

  if (updates.email !== undefined && updates.email !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.email)) {
      throw new Error("Invalid email format.");
    }

    const existing = await User.findOne({ email: updates.email });
    if (existing && existing._id.toString() !== userId) {
      throw new Error("Email is already in use.");
    }

    patchData.email = updates.email;
  }

  // 🔐 Password mapping
  if (updates.password !== undefined && updates.password !== "") {
    const salt = await bcrypt.genSalt(10);
    patchData.hashed_password = await bcrypt.hash(updates.password, salt);
  }

  if (Object.keys(patchData).length === 0) {
    throw new Error("No valid fields to update.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: patchData },
    { new: true, runValidators: true }
  ).select("-hashed_password");

  return ensureBufferConverted(updatedUser);
};  

// Upload profile picture
const uploadProfilePicture = async (userId, fileBuffer, mimeType) => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(mimeType)) {
    throw new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.");
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (fileBuffer.length > maxSize) {
    throw new Error("File size exceeds 5MB limit.");
  }

  // Handle migration: first unset old string format, then set new nested structure
  await User.findByIdAndUpdate(
    userId,
    {
      $unset: { profile_picture: 1 },
    },
    { new: false }
  );

  // Now set the new nested structure
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      profile_picture: {
        data: fileBuffer,
        mimeType: mimeType,
      },
    },
    { new: true, runValidators: true }
  ).select("-hashed_password");

  return ensureBufferConverted(updatedUser);
};

module.exports = {
  getUserById,
  updateUser,
  uploadProfilePicture,
};