const mongoose = require('mongoose');

const scheduleSchema = mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  room_specification: {
    type: String,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  time_start: {
    type: String,
    required: true
  },
  time_end: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;