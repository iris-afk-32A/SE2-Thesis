require("dotenv").config();
const { getUserById, updateUser, uploadProfilePicture } = require("../services/userService");

// Helper function to format user with profile picture
const formatUserResponse = (user) => {
  let profilePicture = null;

  if (user.profile_picture?.data && user.profile_picture?.mimeType) {
    try {
      let buffer = user.profile_picture.data;
      
      // Ensure it's a proper Buffer object
      if (!Buffer.isBuffer(buffer)) {
        console.log("Converting non-Buffer to Buffer:", typeof buffer);
        buffer = Buffer.from(buffer);
      }
      
      const base64Data = buffer.toString("base64");
      
      // Verify base64 length and validate
      if (!base64Data || base64Data.length === 0) {
        throw new Error("Base64 conversion resulted in empty string");
      }
      
      profilePicture = `data:${user.profile_picture.mimeType};base64,${base64Data}`;
      
      // Validate format
      if (!profilePicture.startsWith("data:")) {
        throw new Error("Invalid data URI format");
      }
      
      console.log("Profile picture formatted:", {
        mimeType: user.profile_picture.mimeType,
        base64Length: base64Data.length,
        dataURILength: profilePicture.length,
        startsCorrectly: profilePicture.startsWith("data:"),
      });
    } catch (err) {
      console.error("Error converting profile picture:", err);
      console.error("Buffer details:", {
        hasData: !!user.profile_picture?.data,
        isBuffer: Buffer.isBuffer(user.profile_picture?.data),
        type: typeof user.profile_picture?.data,
      });
    }
  }

  return {
    id: user._id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    profilePicture: profilePicture,
    isAuthorized: user.is_authorized,
    isAdmin: user.is_admin,
  };
};

exports.getMe = async (req, res) => {
  try {
    const user = await getUserById(req.userID);
    if (!user) return res.status(404).json({ message: "User not found." });
    
    const formattedUser = formatUserResponse(user);
    
    console.log("getMe response:", {
      hasProfilePicture: !!formattedUser.profilePicture,
      profilePictureLength: formattedUser.profilePicture?.length,
    });
    
    res.status(200).json(formattedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.patchMe = async (req, res) => {
  try {
    const updated = await updateUser(req.userID, req.body);
    const formattedUser = formatUserResponse(updated);
    res.status(200).json({ message: "Profile updated.", user: formattedUser });
  } catch (err) {
    const status = err.message.includes("already in use") ||
                   err.message.includes("Invalid email") ||
                   err.message.includes("No valid fields") ? 400 : 500;
    res.status(status).json({ message: err.message });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided." });
    }

    console.log("Uploading profile picture for user:", req.userID);
    console.log("File size:", req.file.buffer.length, "bytes");
    console.log("MIME type:", req.file.mimetype);

    const updated = await uploadProfilePicture(
      req.userID,
      req.file.buffer,
      req.file.mimetype
    );

    console.log("Profile picture uploaded successfully");
    console.log("Retrieved profile_picture structure:", {
      hasData: !!updated.profile_picture?.data,
      hasMimeType: !!updated.profile_picture?.mimeType,
      dataType: typeof updated.profile_picture?.data,
      isBuffer: Buffer.isBuffer(updated.profile_picture?.data),
    });

    const formattedUser = formatUserResponse(updated);
    console.log("Formatted response profilePicture length:", formattedUser.profilePicture?.length);
    res.status(200).json({ message: "Profile picture uploaded.", user: formattedUser });
  } catch (err) {
    console.error("uploadProfilePicture error:", err);
    const status = err.message.includes("Invalid file type") ||
                   err.message.includes("exceeds") ? 400 : 500;
    res.status(status).json({ message: err.message });
  }
};
