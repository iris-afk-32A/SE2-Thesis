require("dotenv").config();
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const { getIO } = require("../config/socket");
const Organization = require("../models/organization_model");
const User = require("../models/user_model");

exports.addOrg = async (req, res, next) => {
  try {
    const io = getIO();
    const { org_name } = req.body;
    const userID = req.userID;

    const existingOrg = await Organization.exists({
      organization_name: org_name,
    });

    if (existingOrg) {
      return res.status(400).json({
        message: "Organization already exists",
      });
    }

    const org = new Organization({
      organization_name: org_name,
      organization_owner: userID,
    });

    await org.save();

    const updatedUser = await User.findByIdAndUpdate(
      userID,
      {
        user_organization: org._id,
        is_admin: true,
        is_authorized: true,
      },
      { new: true },
    );

    const newToken = jwt.sign(
      {
        userID: updatedUser._id,
        email: updatedUser.email,
        is_admin: updatedUser.is_admin,
        is_authorized: updatedUser.is_authorized,
        user_organization: updatedUser.user_organization,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    io.emit("orgAdded", {
      _id: org._id,
      organization_name: org.organization_name,
    });

    logger.info({
      message: `ORGANIZATION CREATE -- Organization added ${req.body.org_name}: With status code 201`,
      method: req.method,
      ip: req.ip,
    });

    console.log(req.body);

    return res.status(201).json({
      message: "Organization Added",
      token: newToken,
      user: updatedUser,
      organization: org,
    });
  } catch (error) {
    logger.error({
      message: `ORGANIZATION ADD -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.getOrg = async (req, res) => {
  try {
    const organization = await Organization.find({});

    console.log("ORGANIZATION FOUND:", organization);

    console.log("GET ORGANIZATION -- Request query:", organization._id);

    res.status(200).json(organization);
  } catch (error) {
    console.error("GET ORGANIZATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOrgMembers = async (req, res) => {
  try {
    // const { organization } = req.query;

    // console.log("GET ORG MEMBERS -- Received organization query:", req.query);

    const orgName = await Organization.findById(req.query.organization).select(
      "organization_name",
    );

    console.log("GET ORG MEMBERS -- Found organization:", orgName);

    if (!orgName) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const members = await User.find({
      user_organization: req.query.organization,
    }).select("first_name last_name email is_authorized");

    console.log("GET ORG MEMBERS -- Found members:", members);

    console.log("REQ QUERY:", req.query);

    logger.info({
      message: `ORGANIZATION MEMBERS -- Fetched ${members.length} members for organization: ${orgName.organization_name}`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json({
      organization: orgName.organization_name,
      members,
      memberCount: members.length,
    });
  } catch (error) {
    logger.error({
      message: `ORGANIZATION MEMBERS -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const User = require("../models/user_model");
    const Notification = require("../models/notification_model");
    const { userId, actionType } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    // Get user info before updating to preserve organization name
    const userBeforeUpdate = await User.findById(userId).select(
      "first_name last_name user_organization",
    );
    const orgName = userBeforeUpdate?.user_organization;

    const user = await User.findByIdAndUpdate(
      userId,
      { is_authorized: false, user_organization: "", applied_at: null },
      { new: true },
    ).select("first_name last_name email");

    // Create a notification for the departure
    if (user && orgName) {
      // First, delete any old notifications for this user
      await Notification.deleteMany({
        user_first_name: user.first_name,
        user_last_name: user.last_name,
      });

      // Create departure notification
      const departureMessage =
        actionType === "leave"
          ? `${user.first_name} ${user.last_name} has left our organization`
          : `${user.first_name} ${user.last_name} has been removed from our organization`;

      const notification = new Notification({
        organization_name: orgName,
        message: departureMessage,
        type: actionType === "leave" ? "leave" : "removal",
        user_first_name: user.first_name,
        user_last_name: user.last_name,
      });
      await notification.save();
    }

    logger.info({
      message: `ORGANIZATION MEMBER REMOVED -- ${user.first_name} ${user.last_name} removed from organization`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json({
      message: "Member removed successfully",
      user,
    });
  } catch (error) {
    logger.error({
      message: `ORGANIZATION MEMBER REMOVE -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingApplications = async (req, res) => {
  try {
    const User = require("../models/user_model");
    const userID = req.userID;

    // Get the current user's organization
    const currentUser = await User.findById(userID);
    if (!currentUser || !currentUser.user_organization) {
      return res.status(400).json({
        message: "User does not belong to an organization",
      });
    }

    // Get all users who applied but are not authorized yet
    const pendingApplications = await User.find({
      user_organization: currentUser.user_organization,
      is_authorized: false,
      applied_at: { $ne: null },
    }).select("_id first_name last_name email applied_at");

    logger.info({
      message: `PENDING APPLICATIONS -- Fetched ${pendingApplications.length} pending applications for organization: ${currentUser.user_organization}`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json({
      applications: pendingApplications,
      count: pendingApplications.length,
    });
  } catch (error) {
    logger.error({
      message: `PENDING APPLICATIONS -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const User = require("../models/user_model");
    const Notification = require("../models/notification_model");
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { is_authorized: true },
      { new: true },
    ).select("first_name last_name email user_organization");

    // Create a notification for the approved user
    if (user && user.user_organization) {
      // First, delete any old notifications for this user in this organization
      await Notification.deleteMany({
        organization_name: user.user_organization,
        user_first_name: user.first_name,
        user_last_name: user.last_name,
      });

      // Then create the new join notification
      const notification = new Notification({
        organization_name: user.user_organization,
        message: `${user.first_name} ${user.last_name} has joined our organization, give them a warm welcome!`,
        type: "join",
        user_first_name: user.first_name,
        user_last_name: user.last_name,
      });
      await notification.save();
    }

    logger.info({
      message: `ORGANIZATION APPLICATION APPROVED -- ${user.first_name} ${user.last_name} approved for organization: ${user.user_organization}`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json({
      message: "Application approved successfully",
      user,
    });
  } catch (error) {
    logger.error({
      message: `ORGANIZATION APPLICATION APPROVE -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.rejectApplication = async (req, res) => {
  try {
    const User = require("../models/user_model");
    const Notification = require("../models/notification_model");
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { is_authorized: false, user_organization: "", applied_at: null },
      { new: true },
    ).select("first_name last_name email");

    // Delete any old notifications for this user from their previous membership
    if (user) {
      await Notification.deleteMany({
        user_first_name: user.first_name,
        user_last_name: user.last_name,
      });
    }

    logger.info({
      message: `ORGANIZATION APPLICATION REJECTED -- ${user.first_name} ${user.last_name} rejected for organization`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json({
      message: "Application rejected successfully",
      user,
    });
  } catch (error) {
    logger.error({
      message: `ORGANIZATION APPLICATION REJECT -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const Notification = require("../models/notification_model");
    const User = require("../models/user_model");
    const userID = req.userID;

    // Get the current user's organization
    const currentUser = await User.findById(userID);
    if (!currentUser || !currentUser.user_organization) {
      return res.status(400).json({
        message: "User does not belong to an organization",
      });
    }

    // Get all notifications for the organization
    const notifications = await Notification.find({
      organization_name: currentUser.user_organization,
    }).sort({ created_at: -1 });

    logger.info({
      message: `NOTIFICATIONS -- Fetched ${notifications.length} notifications for organization: ${currentUser.user_organization}`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json({
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    logger.error({
      message: `NOTIFICATIONS -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};
