const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 管理员模型
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

async function initAdmin() {
    try {
        // 连接数据库
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('数据库连接成功');

        // 检查是否已存在管理员
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('管理员账户已存在');
            return;
        }

        // 创建管理员账户
        const hashedPassword = await bcrypt.hash('admin123456', 10);
        const admin = new Admin({
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            status: true
        });

        await admin.save();
        console.log('管理员账户创建成功');

    } catch (error) {
        console.error('初始化管理员账户失败:', error);
    } finally {
        await mongoose.disconnect();
    }
}

initAdmin(); 