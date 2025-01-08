const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const adminRoutes = require('./routes/admin');
const auth = require('./middleware/auth');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// 数据库连接
mongoose.connect(process.env.MONGODB_URI);

// API路由
app.use('/api/admin', adminRoutes);

// 需要认证的API路由
app.use('/api/admin/tools', auth);
app.use('/api/admin/categories', auth);

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        code: 500,
        message: '服务器内部错误'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 