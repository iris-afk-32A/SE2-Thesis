const mongoose = require('mongoose');

const cameraDeviceSchema = mongoose.Schema({
    room_location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    is_active: {
        type: Boolean,
        default: false
    },
    is_infrared: {
        type: Boolean,
        default: false
    }
});

const cameraDevice =  mongoose.model('CameraDevice', cameraDeviceSchema);
module.exports = cameraDevice;