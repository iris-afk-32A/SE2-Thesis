const mongoose = require('mongoose');

const roiSchema = mongoose.Schema({
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    roi_index: {
        type: Number,
        required: true
    }
});

const RoomROI = mongoose.model('RoomROI', roiSchema);
module.exports = RoomROI;