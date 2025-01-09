const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '工具名称不能为空'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, '工具描述不能为空'],
        trim: true
    },
    detailDescription: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        required: [true, '工具URL不能为空'],
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, '工具分类不能为空']
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    logoUrl: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    features: [{
        type: String,
        trim: true
    }],
    weight: {
        type: Number,
        default: 0,
        index: true
    },
    viewCount: {
        type: Number,
        default: 0
    },
    likeCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    pricing: {
        type: String,
        enum: ['free', 'paid'],
        default: 'free',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 索引
toolSchema.index({ name: 1 });
toolSchema.index({ category: 1 });
toolSchema.index({ status: 1 });
toolSchema.index({ weight: -1, createdAt: -1 });

// 虚拟字段
toolSchema.virtual('categoryInfo', {
    ref: 'Category',
    localField: 'category',
    foreignField: '_id',
    justOne: true
});

const Tool = mongoose.model('Tool', toolSchema);
module.exports = Tool; 