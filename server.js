const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();
const tr46 = require('tr46');

// 导入模型（这里会自动连接数据库）
const { Admin } = require('./models');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 认证中间件
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: '未登录' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const admin = await Admin.findById(decoded.id);
        
        if (!admin) {
            return res.status(401).json({ message: '用户不存在' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error('认证错误:', error);
        res.status(401).json({ message: '认证失败' });
    }
};

// API 路由 - 需要在静态文件服务之前
app.post('/api/admin/login', async (req, res) => {
    console.log('收到登录请求:', req.body);
    try {
        const { username, password } = req.body;
        
        // 查找用户
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 验证密码 - 临时跳过密码验证
        // const isMatch = await bcrypt.compare(password, admin.password);
        const isMatch = password === admin.password; // 临时直接比较明文密码
        if (!isMatch) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 生成 token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 添加分类管理的 API 路由
const categoryRoutes = require('./api/routes/category');
app.use('/api/admin/categories', authMiddleware, categoryRoutes);

// 静态文件服务
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            // 为所有 JS 文件设置正确的 MIME 类型
            res.set('Content-Type', 'application/javascript');
        }
        // 允许跨域请求和模块加载
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

// 页面路由
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get('/admin/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.redirect('/admin/login');
});

// 请求日志中间件
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ message: '服务器错误' });
});

// 404 处理 - 放在最后
app.use((req, res) => {
    console.log('404 未找到:', req.url);
    if (req.url.endsWith('.html')) {
        res.status(404).sendFile(path.join(__dirname, 'admin', '404.html'));
    } else {
        res.status(404).json({ message: '页面未找到' });
    }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`分类列表页面 URL: http://localhost:${PORT}/admin/categories.html`);
}); 