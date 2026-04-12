const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
    subject_code: {
        type: String,
        required: true
    },
    subject_name: {
        type: String,
        required: true
    },
    organization_id: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;
