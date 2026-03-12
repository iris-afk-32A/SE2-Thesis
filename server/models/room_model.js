const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
    room_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room_occupants: {
        type: Number,
        default: 0
    }
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;