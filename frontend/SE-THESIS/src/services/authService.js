import axiosClient from "../api/axiosClient.api";

// *Authentication service. This is done pretty much so nothing to change here.

export const registerUser = async (userData) => {
  const response = await axiosClient.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axiosClient.post("/auth/login", userData);
  return response.data;
};
