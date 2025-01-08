const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '分类名称不能为空'],
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: [true, '分类代码不能为空'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
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

const Category = mongoose.model('Category', categorySchema);
module.exports = Category; 