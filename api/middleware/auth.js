const jwt = require('jsonwebtoken');
const { Admin } = require('../../models');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findOne({ _id: decoded.id, status: 'active' });

        if (!admin) {
            throw new Error();
        }

        req.token = token;
        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({
            code: 401,
            message: '请先登录'
        });
    }
};

module.exports = auth;