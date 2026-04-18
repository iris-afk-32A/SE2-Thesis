// server/controller/home.js
const axios = require("axios");
const path = require("path");
const Room = require("../models/room_model");
const { getIO } = require("../config/socket");

const imagePath = path.join(__dirname, "../images/sample2.jpg");

// TODO: This need a complete overhaul like wtf is this. Spaghetti ah shi (シ_ _)シ

// !This needs a dedicated controller (I know this is in development, but shit it giving me headaches)
// TODO: Well refactor then move it to its dedicated controller, then add comments on this shit too
const getPeopleCount = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const FormData = require("form-data");
    const axios = require("axios");

    console.log("Received file:", req.file);

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: "frame.jpg",
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      "http://localhost:8000/detect",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error in getPeopleCount:",
      error.response?.data || error.message,
    );
    res.status(500).json({ error: "Failed to process image" });
  }
};

const detectRoomFrame = async (req, res) => {
  try {
    // console.log("BODY:", req.body);
    // console.log("FILE:", req.file);
    const room_id = req.body.room_id;
    const exit_points = req.body.exit_points;

    if (!room_id) {
      return res.status(400).json({ error: "room_id is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Build FormData for FastAPI
    const FormData = require("form-data");
    const formData = new FormData();

    formData.append("file", req.file.buffer, {
      filename: "frame.jpg",
      contentType: req.file.mimetype,
    });

    formData.append("room_id", room_id);
    formData.append("exit_points", exit_points || "[]");

    // Send to FastAPI
    const response = await axios.post(
      "http://localhost:8000/detect",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    const peopleCount = response.data.features?.estimated_occupancy ?? 0;

    console.log("Estimated Occupancy for room", room_id, ":", peopleCount);

    const room = await Room.findById(room_id);

    console.log("Updating room", room_id, "with occupancy:", peopleCount);

    await Room.findByIdAndUpdate(room_id, { room_occupants: peopleCount });

    const io = getIO();
    io.emit("roomUpdated", {
      roomId: room_id,
      people_count: peopleCount,
    });
    console.log("Emitting roomUpdated event for room", room_id, "with occupancy:", peopleCount);


    // Return actual inference result
    return res.status(200).json({
      room_id,
      ...response.data,
    });
  } catch (error) {
    console.error(
      "Error in detectRoomFrame:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      error: "Failed to process frame",
      details: error.response?.data,
    });
  }
};

// ! Well theres nothing much to change in this
const getHealth = async (req, res) => {
  try {
    const response = await axios.get("http://localhost:8000/health");
    res.status(200).json({ status: response.data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch health status" });
  }
};

module.exports = {
  getPeopleCount,
  detectRoomFrame,
  getHealth,
};
