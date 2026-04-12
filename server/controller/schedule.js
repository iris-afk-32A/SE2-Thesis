require("dotenv").config();
const Schedule = require("../models/schedule_model");
const Room = require("../models/room_model");
const logger = require("../utils/logger");

exports.addSchedule = async (req, res) => {
  console.log("HIT: addSchedule", req.body);
  try {
    const { roomId, subjectId, room_specification, day, time_start, time_end } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const schedule = new Schedule({
      room: roomId,
      subject: subjectId,
      room_specification,
      day,
      time_start,
      time_end
    });

    await schedule.save();

    const populatedSchedule = await schedule.populate([
      { path: "room", select: "room_name" },
      { path: "subject", select: "subject_code subject_name" }
    ]);

    logger.info({
      message: `SCHEDULE CREATE -- Schedule added for room ${room.room_name}`,
      method: req.method,
      ip: req.ip,
    });

    res.status(201).json({ message: "Schedule added successfully", schedule: populatedSchedule });
  } catch (error) {
    logger.error({
      message: `SCHEDULE CREATE -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.getSchedulesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const schedules = await Schedule.find({ room: roomId })
      .populate("subject", "subject_code subject_name")
      .populate("room", "room_name");

    res.status(200).json(schedules);
  } catch (error) {
    logger.error({
      message: `SCHEDULE FETCH -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};