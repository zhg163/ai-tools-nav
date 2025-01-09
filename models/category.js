const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '名称为必填项'],
        trim: true
    },
    code: {
        type: String,
        required: [true, '代码为必填项'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, '描述为必填项'],
        trim: true
    },
    weight: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema); 