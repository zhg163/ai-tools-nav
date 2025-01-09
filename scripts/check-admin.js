const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('../api/models/admin');

async function checkAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('数据库连接成功');

        const admin = await Admin.findOne({ username: 'admin' });
        if (admin) {
            console.log('找到管理员账户:', {
                username: admin.username,
                role: admin.role,
                status: admin.status,
                createdAt: admin.createdAt,
                passwordLength: admin.password.length
            });
        } else {
            console.log('未找到管理员账户');
        }
    } catch (error) {
        console.error('查询失败:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkAdmin(); 