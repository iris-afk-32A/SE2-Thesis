import axiosClient from "../api/axiosClient.api";

export const sendOTP = async (email) => {
  try {
    const response = await axiosClient.post("/auth/forgot-password/send-otp", { email });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await axiosClient.post("/auth/forgot-password/verify-otp", { email, otp });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const resetPassword = async (email, otp, new_password) => {
  try {
    const response = await axiosClient.post("/auth/forgot-password/reset-password", { 
      email, 
      otp, 
      new_password 
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
