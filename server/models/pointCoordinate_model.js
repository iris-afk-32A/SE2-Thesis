const mongoose = require("mongoose");

const pointCoordinateSchema = new mongoose.Schema({
  camera_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CameraDevice",
    required: true,
  },

  point_x: {
    type: Number,
    required: true,
  },

  point_y: {
    type: Number,
    required: true,
  },

  corner_location: {
    type: String,
    required: true,
  },

  zone_type: {
    type: String,
    required: true,
  },

  time_created: {
    type: Date,
    default: Date.now,
  },
});

const PointCoordinate = mongoose.model(
  "PointCoordinate",
  pointCoordinateSchema,
);

module.exports = PointCoordinate;
