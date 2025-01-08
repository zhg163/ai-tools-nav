const mongoose = require('mongoose');
require('dotenv').config();

// 设置默认的数据库 URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tools-nav';

// 连接MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB 连接成功');
}).catch(err => {
    console.error('MongoDB 连接错误：', err);
});

module.exports = {
    Tool: require('./tool'),
    Admin: require('./admin'),
    Category: require('./category')
}; 