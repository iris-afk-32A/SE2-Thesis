import axiosClient from "../api/axiosClient.api";

// Get logged in user profile
export const getMyProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Unauthorized: Unknown user");

    const response = await axiosClient.get("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("getMyProfile error:", error);
    throw error;
  }
};

// Update logged in user profile (PATCH)
export const updateMyProfile = async (patchData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Unauthorized: Unknown user");

    const response = await axiosClient.patch(
      "/api/users/me",
      patchData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  } catch (error) {
    console.error("updateMyProfile error:", error);
    // Extract the backend error message if available
    const message = error.response?.data?.message || error.message || "Failed to update profile";
    throw new Error(message);
  }
};

// Upload profile picture
export const uploadProfilePicture = async (file) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Unauthorized: Unknown user");

    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await axiosClient.post(
      "/api/users/me/profile-picture",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("uploadProfilePicture error:", error);
    const message = error.response?.data?.message || error.message || "Failed to upload profile picture";
    throw new Error(message);
  }
};