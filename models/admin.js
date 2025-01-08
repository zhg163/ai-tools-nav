const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, '用户名不能为空'],
        unique: true,
        trim: true,
        minlength: [4, '用户名至少4个字符'],
        maxlength: [20, '用户名最多20个字符']
    },
    password: {
        type: String,
        required: [true, '密码不能为空'],
        minlength: [6, '密码至少6个字符']
    },
    role: {
        type: String,
        enum: ['superAdmin', 'admin'],
        default: 'admin'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    lastLoginAt: Date,
    loginCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// 密码加密中间件
adminSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// 验证密码方法
adminSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin; 