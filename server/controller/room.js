require("dotenv").config();
const Room = require("../models/room_model");
const User = require("../models/user_model");
const { getIO } = require("../config/socket");
const logger = require("../utils/logger");

// TODO: Add comments (tinatamad na ko man sub na) ┐ ( -“-) ┌

exports.addRoom = async (req, res, next) => {
  try {
    const io = getIO();
    const { room_name } = req.body;

    const userExists = await User.exists({ _id: req.userID });

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingRoom = await Room.findOne({ room_name, room_owner: req.userID })
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
      room_owner: req.userID,
    });

    await room.save();
    logger.info({
      message: `ROOM CREATE -- Room added ${req.body.room_name}: With status code 201`,
      method: req.method,
      ip: req.ip,
    });

    const populatedRoom = await room.populate("room_owner", "first_name email");
    io.emit("roomAdded", populatedRoom);

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
    const rooms = await Room.find({
      room_owner: req.userID,
    }).populate("room_owner", "first_name");
    console.log("ROOMS:", room)

    res.status(200).json(rooms);
  } catch (error) {
    logger.error({
      message: `ROOM FETCH -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};
