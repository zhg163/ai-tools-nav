const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Admin, Tool, Category } = require('../../models');

// 管理员登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        
        if (!admin || admin.password !== password) {
            return res.status(401).json({
                code: 1,
                message: '用户名或密码错误'
            });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            code: 0,
            data: {
                token,
                admin: {
                    username: admin.username,
                    role: admin.role
                }
            },
            message: '登录成功'
        });
    } catch (error) {
        res.status(500).json({
            code: 1,
            message: error.message
        });
    }
});

// 获取工具列表
router.get('/tools', async (req, res) => {
    try {
        const { page = 1, pageSize = 10, category, status } = req.query;
        const query = {};
        
        if (category) query.category = category;
        if (status) query.status = status;
        
        const total = await Tool.countDocuments(query);
        const tools = await Tool.find(query)
            .populate('category')
            .sort({ weight: -1, createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize));
            
        res.json({
            code: 0,
            data: {
                list: tools,
                total,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            }
        });
    } catch (error) {
        res.status(500).json({
            code: 1,
            message: error.message
        });
    }
});

// 创建工具
router.post('/tools', async (req, res) => {
    try {
        const tool = new Tool(req.body);
        await tool.save();
        res.status(201).json({
            code: 0,
            data: tool,
            message: '创建成功'
        });
    } catch (error) {
        res.status(400).json({
            code: 1,
            message: error.message
        });
    }
});

// 更新工具
router.put('/tools/:id', async (req, res) => {
    try {
        const tool = await Tool.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({
            code: 0,
            data: tool,
            message: '更新成功'
        });
    } catch (error) {
        res.status(400).json({
            code: 1,
            message: error.message
        });
    }
});

// 删除工具
router.delete('/tools/:id', async (req, res) => {
    try {
        await Tool.findByIdAndDelete(req.params.id);
        res.json({
            code: 0,
            message: '删除成功'
        });
    } catch (error) {
        res.status(400).json({
            code: 1,
            message: error.message
        });
    }
});

// 获取分类列表
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ weight: -1, createdAt: -1 });
        res.json({
            code: 0,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            code: 1,
            message: error.message
        });
    }
});

module.exports = router; 