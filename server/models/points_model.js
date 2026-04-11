const mongoose = require('mongoose');

const pointSchema = mongoose.Schema({
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    point_x: {
        type: Number,
        required: true
    },
    point_y: {
        type: Number,
        required: true
    },
    point_index: {
        type: Number,
        required: true
    },
    point_order: {
        type: Number,
        required: true
    }
});

const ROIPoint = mongoose.model('ROIPoint', pointSchema);
module.exports = ROIPoint;