require("dotenv").config();
const Room = require("../models/room_model");
const User = require("../models/user_model");
const { getIO } = require("../config/socket");
const logger = require("../utils/logger");

// TODO: Add comments (tinatamad na ko man sub na) ┐ ( -“-) ┌

exports.addRoom = async (req, res, next) => {
  console.log("------------------------ ROOM ADDING -----------------------");
  try {
    const availablePins = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const io = getIO();
    const { room_name } = req.body;
    const user = await User.findById(req.userID);
    const org = await User.findById(req.userID)
      .select("user_organization")
      .populate("user_organization", "org_name");

    console.log("ORGANIZATION:", org.user_organization);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.user_organization) {
      return res
        .status(400)
        .json({ message: "User is not part of any organization" });
    }

    const usedPins = await Room.find({ relay_pin: { $ne: null } }).distinct("relay_pin");
    const assignedPin = availablePins.find((pin) => !usedPins.includes(pin));

    if (!assignedPin) {
      return res.status(400).json({ message: "No available relay pins" });
    }

    const existingRoom = await Room.findOne({ room_name, room_owner: org._id });
    if (existingRoom) {
      logger.error({
        message: `ROOM CREATE -- Attempted to create a room with an existing name`,
        method: req.method,
        ip: req.ip,
      });
      return res
        .status(400)
        .json({ message: "Room with this name already exist." });
    }

    const room = new Room({
      room_name,
      room_owner: org.user_organization,
      relay_pin: assignedPin
    });

    await room.save();
    logger.info({
      message: `ROOM CREATE -- Room added ${req.body.room_name}: With status code 201`,
      method: req.method,
      ip: req.ip,
    });

    const populatedRoom = await room.populate("room_owner", "first_name email");
    io.emit("roomAdded", populatedRoom);

    console.log("------------------------------------------------------------");

    res.status(201).json({
      message: "Room added successfully",
      room: populatedRoom,
    });
  } catch (error) {
    logger.error({
      message: `ROOM CREATE -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.getRooms = async (req, res, next) => {
  try {
    const user = await User.findById(req.userID);
    console.log(
      "------------------------ ROOM FETCHING -----------------------",
    );

    console.log("USER:", user.user_organization);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.user_organization) {
      return res.status(200).json([]);
    }

    const room = await Room.find({
      room_owner: user.user_organization,
    }).populate("room_owner", "first_name email");

    logger.info({
      message: `ROOMS FETCHED -- ${room}`,
    });

    console.log("ROOMS:", room);

    console.log("------------------------------------------------------------");

    res.status(200).json(room);
  } catch (error) {
    logger.error({
      message: `ROOM FETCH -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    console.log(
      "------------------------ ROOM FETCHING -----------------------",
    );
    const { roomId } = req.params;
    const user = await User.findById(req.userID);

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Verify that the user owns this room
    if (String(room.room_owner) !== String(user.user_organization)) {
      logger.error({
        message: `ROOM DELETE -- Unauthorized deletion attempt by user ${req.userID}`,
        method: req.method,
        ip: req.ip,
      });
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this room" });
    }

    await Room.findByIdAndDelete(roomId);

    logger.info({
      message: `ROOM DELETE -- Room deleted: ${room.room_name}`,
      method: req.method,
      ip: req.ip,
    });

    const io = getIO();
    io.emit("roomDeleted", { roomId });
    console.log("------------------------------------------------------------");

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    logger.error({
      message: `ROOM DELETE -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.getRoomSpecifications = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const rooms = await Room.find({
      room_organization: room.room_organization,
      room_specification: { $ne: null },
    }).select("room_specification");

    // get unique specs only
    const specs = [...new Set(rooms.map((r) => r.room_specification))];

    res.status(200).json(specs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRoomSpecification = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { room_specification } = req.body;

    const room = await Room.findByIdAndUpdate(
      roomId,
      { room_specification },
      { new: true },
    );

    if (!room) return res.status(404).json({ message: "Room not found" });

    logger.info({
      message: `ROOM UPDATE SPEC -- Room ${room.room_name} spec updated to ${room_specification}`,
      method: req.method,
      ip: req.ip,
    });

    res
      .status(200)
      .json({ message: "Room specification updated successfully", room });
  } catch (error) {
    logger.error({
      message: `ROOM UPDATE SPEC -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};
