const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
    room_name: {
        type: String,
        required: true
    },
    room_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room_occupants: {
        type: Number,
        default: 0
    },
    room_specification: {
        type: String,
        default: null
    },
    relay_pin: {
        type: Number,
        default: null
    }
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;