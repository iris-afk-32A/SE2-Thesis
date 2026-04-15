import axiosClient from "../api/axiosClient.api";

export const addOrganization = async (orgData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: Unknown user");
    }
    const response = await axiosClient.post("/organization/addOrganization", orgData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getOrganization = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Unauthorized: Unknown user");
    }
    const response = await axiosClient.get("/organization/getOrganization", {
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

export const getOrganizationMembers = async (organizationID) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: Unknown user");
    }
    const response = await axiosClient.get("/organization/getMembers", {
      params: {
        organization: organizationID,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log("API response for getOrganizationMembers:", response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeMemberFromOrganization = async (userId, actionType = "remove") => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: Unknown user");
    }
    const response = await axiosClient.post("/organization/removeMember", 
      { userId, actionType },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPendingApplications = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: Unknown user");
    }
    const response = await axiosClient.get("/organization/getPendingApplications", {
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

export const approveApplication = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: Unknown user");
    }
    const response = await axiosClient.post("/organization/approveApplication", 
      { userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const rejectApplication = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: Unknown user");
    }
    const response = await axiosClient.post("/organization/rejectApplication", 
      { userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getNotifications = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: Unknown user");
    }
    const response = await axiosClient.get("/organization/getNotifications", {
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

export const updateOrganization = async (organizationName) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axiosClient.patch("/organization/update-organization", 
      { org_name: organizationName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};