import axiosClient from "../api/axiosClient.api";

export const addSchedule = async (scheduleData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Unauthorized: Unknown user");
    const response = await axiosClient.post("/schedule/create", scheduleData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSchedulesByRoom = async (roomId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Unauthorized: Unknown user");
    const response = await axiosClient.get(`/schedule/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};