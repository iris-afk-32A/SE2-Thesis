const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  // Wala dito yung user_id kasi sa may _id object na agad sa MongoDB
  device_location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  device_type: {
    type: String,
    required: true
  },
  device_label: {
    type: String,
    required: true
  },
  is_active: {
    type: Boolean,
    default: false
  },
  time_created: {
    type: Date,
    default: Date.now
  }
});

const Device = mongoose.model('Device', deviceSchema);
module.exports = Device;
