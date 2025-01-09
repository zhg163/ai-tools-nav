const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    try {
        // 从请求头获取 token
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                code: 401,
                message: '未提供认证令牌'
            });
        }

        // 验证 token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('认证失败:', error);
        res.status(401).json({
            code: 401,
            message: '认证失败'
        });
    }
}

module.exports = auth;