import axiosClient from "../api/axiosClient.api";

export const sendOTP = async (email) => {
  console.log(`[sendOTP] Step 1: Function called with email: ${email}`);
  try {
    console.log(`[sendOTP] Step 2: About to make POST request to /auth/forgot-password/send-otp`);
    const response = await axiosClient.post("/auth/forgot-password/send-otp", { email });
    console.log(`[sendOTP] Step 3: Success response received:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[sendOTP] Step X: Error caught!`);
    console.error(`[sendOTP] Error type:`, error.constructor.name);
    console.error(`[sendOTP] Error response:`, error.response?.data);
    console.error(`[sendOTP] Error status:`, error.response?.status);
    console.error(`[sendOTP] Error message:`, error.message);
    console.error(`[sendOTP] Full error object:`, error);
    throw error;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    console.log(`[verifyOTP] Verifying OTP for email: ${email}, OTP: ${otp}`);
    const response = await axiosClient.post("/auth/forgot-password/verify-otp", { email, otp });
    console.log(`[verifyOTP] Success response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[verifyOTP] Error occurred:`, error.response?.data || error.message);
    console.error(`[verifyOTP] Full error:`, error);
    throw error;
  }
};

export const resetPassword = async (email, otp, new_password) => {
  try {
    console.log(`[resetPassword] Resetting password for email: ${email}`);
    const response = await axiosClient.post("/auth/forgot-password/reset-password", { 
      email, 
      otp, 
      new_password 
    });
    console.log(`[resetPassword] Success response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[resetPassword] Error occurred:`, error.response?.data || error.message);
    console.error(`[resetPassword] Full error:`, error);
    throw error;
  }
};
