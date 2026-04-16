require("dotenv").config();
const logger = require("../utils/logger");
const { getIO } = require("../config/socket");
const ClassroomRequest = require("../models/classroom_request_model");
const Room = require("../models/room_model");
const User = require("../models/user_model");
const Organization = require("../models/organization_model");

exports.createClassroomRequest = async (req, res) => {
  try {
    const { classroom_name } = req.body;
    const userID = req.userID;

    if (!classroom_name) {
      return res.status(400).json({
        message: "Classroom name is required",
      });
    }

    const user = await User.findById(userID);
    if (!user || !user.user_organization) {
      return res.status(400).json({
        message: "User does not belong to an organization",
      });
    }

    // Create classroom request
    const classroomRequest = new ClassroomRequest({
      classroom_name,
      organization_id: user.user_organization,
      requested_by: userID,
      requested_by_name: `${user.first_name} ${user.last_name}`,
      status: "pending",
    });

    await classroomRequest.save();

    logger.info({
      message: `CLASSROOM REQUEST CREATED -- ${user.first_name} ${user.last_name} requested classroom: "${classroom_name}"`,
      method: req.method,
      ip: req.ip,
    });

    res.status(201).json({
      message: "Classroom request submitted for approval",
      classroomRequest,
    });
  } catch (error) {
    logger.error({
      message: `CLASSROOM REQUEST CREATE -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingClassroomRequests = async (req, res) => {
  try {
    const userID = req.userID;

    // Get the current user's organization
    const currentUser = await User.findById(userID);
    if (!currentUser || !currentUser.user_organization) {
      return res.status(400).json({
        message: "User does not belong to an organization",
      });
    }

    // Only admins can see pending requests
    if (!currentUser.is_admin) {
      return res.status(403).json({
        message: "Only admins can view classroom requests",
      });
    }

    // Get all pending classroom requests for this organization
    const pendingRequests = await ClassroomRequest.find({
      organization_id: currentUser.user_organization,
      status: "pending",
    }).sort({ created_at: -1 });

    logger.info({
      message: `PENDING CLASSROOM REQUESTS -- Fetched ${pendingRequests.length} pending requests for organization: ${currentUser.user_organization}`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json({
      requests: pendingRequests,
      count: pendingRequests.length,
    });
  } catch (error) {
    logger.error({
      message: `PENDING CLASSROOM REQUESTS -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.approveClassroomRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userID = req.userID;

    if (!requestId) {
      return res.status(400).json({
        message: "Request ID is required",
      });
    }

    // Verify user is admin
    const adminUser = await User.findById(userID);
    if (!adminUser || !adminUser.is_admin) {
      return res.status(403).json({
        message: "Only admins can approve classroom requests",
      });
    }

    // Get the classroom request
    const classroomRequest = await ClassroomRequest.findById(requestId);
    if (!classroomRequest) {
      return res.status(404).json({
        message: "Classroom request not found",
      });
    }

    if (classroomRequest.status !== "pending") {
      return res.status(400).json({
        message: `Request has already been ${classroomRequest.status}`,
      });
    }

    // Verify the request belongs to the admin's organization
    if (classroomRequest.organization_id.toString() !== adminUser.user_organization.toString()) {
      return res.status(403).json({
        message: "Unauthorized to approve this request",
      });
    }

    // Create the classroom room
    const newRoom = new Room({
      room_name: classroomRequest.classroom_name,
      room_owner: userID,
      room_organization: classroomRequest.organization_id,
      room_occupants: 0,
    });

    await newRoom.save();

    // Update classroom request status
    classroomRequest.status = "approved";
    classroomRequest.updated_at = new Date();
    await classroomRequest.save();

    logger.info({
      message: `CLASSROOM REQUEST APPROVED -- Admin ${adminUser.first_name} ${adminUser.last_name} approved classroom request: "${classroomRequest.classroom_name}"`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json({
      message: "Classroom request approved and classroom created",
      classroom: newRoom,
    });
  } catch (error) {
    logger.error({
      message: `CLASSROOM REQUEST APPROVE -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.rejectClassroomRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userID = req.userID;

    if (!requestId) {
      return res.status(400).json({
        message: "Request ID is required",
      });
    }

    // Verify user is admin
    const adminUser = await User.findById(userID);
    if (!adminUser || !adminUser.is_admin) {
      return res.status(403).json({
        message: "Only admins can reject classroom requests",
      });
    }

    // Get the classroom request
    const classroomRequest = await ClassroomRequest.findById(requestId);
    if (!classroomRequest) {
      return res.status(404).json({
        message: "Classroom request not found",
      });
    }

    if (classroomRequest.status !== "pending") {
      return res.status(400).json({
        message: `Request has already been ${classroomRequest.status}`,
      });
    }

    // Verify the request belongs to the admin's organization
    if (classroomRequest.organization_id.toString() !== adminUser.user_organization.toString()) {
      return res.status(403).json({
        message: "Unauthorized to reject this request",
      });
    }

    // Update classroom request status
    classroomRequest.status = "rejected";
    classroomRequest.updated_at = new Date();
    await classroomRequest.save();

    logger.info({
      message: `CLASSROOM REQUEST REJECTED -- Admin ${adminUser.first_name} ${adminUser.last_name} rejected classroom request: "${classroomRequest.classroom_name}"`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json({
      message: "Classroom request rejected",
      request: classroomRequest,
    });
  } catch (error) {
    logger.error({
      message: `CLASSROOM REQUEST REJECT -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};
