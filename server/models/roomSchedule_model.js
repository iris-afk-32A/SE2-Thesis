const mongoose = require('mongoose');

const roomScheduleSchema = mongoose.Schema({
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String,
        required: true
    }
});

const roomSchedule = mongoose.model('RoomSchedule', roomScheduleSchema);
module.exports = roomSchedule;