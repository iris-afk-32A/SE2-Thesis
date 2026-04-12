import axiosClient from "../api/axiosClient.api";

// *Authentication service. This is done pretty much so nothing to change here.

export const addRoom = async (roomData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: Unknown user");
    }
    const response = await axiosClient.post("/room/create", roomData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getRooms = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: Unknown user");
    }

    const response = await axiosClient.get("/room/list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteRoom = async (roomId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: Unknown user");
    }

    const response = await axiosClient.delete(`/room/${roomId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const detectFrame = async (formData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: Unknown user");
    }

    const response = await axiosClient.post("/server/home/detect-room-frame", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // do NOT set Content-Type manually
      },
      transformRequest: [(data) => data],
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getRoomSpecifications = async (roomId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axiosClient.get(`/room/specs/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRoomSpecification = async (roomId, room_specification) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Unauthorized: Unknown user");
    const response = await axiosClient.patch(`/room/${roomId}/specification`,
      { room_specification },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};