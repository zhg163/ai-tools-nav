const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Admin, Tool, Category } = require('../../models');
const mongoose = require('mongoose');

// 管理员登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('登录请求:', { username, timestamp: new Date().toISOString() });
        
        // 查找用户
        const admin = await Admin.findOne({ username });
        console.log('查找用户结果:', admin ? {
            found: true,
            username: admin.username,
            role: admin.role,
            status: admin.status
        } : { found: false });

        if (!admin) {
            console.log('用户不存在');
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, admin.password);
        console.log('密码验证结果:', { isValid: isValidPassword });
        
        if (!isValidPassword) {
            console.log('密码错误');
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 生成 token
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('登录成功，已生成token');
        res.json({ token });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取工具列表
router.get('/tools', auth, async (req, res) => {
    try {
        // 添加缓存控制头
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        const { page = 1, pageSize = 10, category, status, pricing } = req.query;
        console.log('收到的查询参数:', { page, pageSize, category, status, pricing });
        const query = {};

        // 构建查询条件
        if (category) query.category = category;
        if (status) query.status = status;
        if (pricing === 'free' || pricing === 'paid') {
            query.pricing = pricing;
            console.log('添加收费查询条件:', pricing);
        }

        console.log('构建的查询条件:', query);

        // 查询前检查数据库中的记录
        const sampleTools = await Tool.find({}, { name: 1, pricing: 1 }).limit(5);
        console.log('数据库样本数据:', sampleTools);

        // 计算总数
        const total = await Tool.countDocuments(query);
        console.log('符合条件的记录总数:', total);

        // 查询数据
        const tools = await Tool.find(query)
            .populate('category', 'name code')
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize));
        
        console.log('查询结果:', {
            总数: total,
            当前页数据量: tools.length,
            示例数据: tools.slice(0, 2).map(t => ({
                id: t._id,
                name: t.name,
                pricing: t.pricing
            }))
        });

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
        console.error('获取工具列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取工具列表失败'
        });
    }
});

// 创建工具
router.post('/tools', auth, async (req, res) => {
    try {
        const toolData = req.body;
        // 确保 pricing 字段的值是有效的
        if (!['free', 'paid'].includes(toolData.pricing)) {
            toolData.pricing = 'free'; // 默认设置为免费
        }
        
        const tool = new Tool(toolData);
        await tool.save();
        
        res.json({
            code: 0,
            data: tool,
            message: '工具创建成功'
        });
    } catch (error) {
        console.error('创建工具失败:', error);
        res.status(400).json({
            code: 1,
            message: error.message
        });
    }
});

// 更新工具
router.put('/tools/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // 确保 pricing 字段的值是有效的
        if (!['free', 'paid'].includes(updateData.pricing)) {
            updateData.pricing = 'free'; // 默认设置为免费
        }
        
        const tool = await Tool.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        if (!tool) {
            return res.status(404).json({
                code: 1,
                message: '工具不存在'
            });
        }
        
        res.json({
            code: 0,
            data: tool,
            message: '工具更新成功'
        });
    } catch (error) {
        console.error('更新工具失败:', error);
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
        console.log('开始查询分类列表');

        const categories = await Category.find()
            .sort({ weight: -1, createdAt: -1 });
        
        console.log('查询到的分类数据:', {
            总数: categories.length,
            数据: categories.map(cat => ({
                id: cat._id,
                name: cat.name,
                code: cat.code,
                status: cat.status,
                weight: cat.weight
            }))
        });
        
        res.json({
            code: 0,
            data: categories
        });
    } catch (error) {
        console.error('获取分类列表失败:', error);
        res.status(500).json({
            code: 1,
            message: error.message
        });
    }
});

// 创建分类
router.post('/categories', async (req, res) => {
    try {
        console.log('接收到的创建分类请求数据:', req.body);

        // 验证必填字段
        const { name, code, description } = req.body;
        if (!name || !code || !description) {
            return res.status(400).json({
                code: 1,
                message: '名称、代码和描述为必填项'
            });
        }

        // 检查代码是否已存在
        const existingCategory = await Category.findOne({ code });
        if (existingCategory) {
            return res.status(400).json({
                code: 1,
                message: '该分类代码已存在'
            });
        }

        const category = new Category(req.body);
        console.log('准备保存的分类数据:', category);

        await category.save();
        console.log('分类保存成功:', category);

        res.json({
            code: 0,
            data: category,
            message: '创建成功'
        });
    } catch (error) {
        console.error('创建分类失败:', error);
        res.status(400).json({
            code: 1,
            message: error.message || '创建分类失败'
        });
    }
});

// 获取单个分类
router.get('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                code: 1,
                message: '分类不存在'
            });
        }
        res.json({
            code: 0,
            data: category
        });
    } catch (error) {
        console.error('获取分类详情失败:', error);
        res.status(500).json({
            code: 1,
            message: error.message
        });
    }
});

// 更新分类
router.put('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!category) {
            return res.status(404).json({
                code: 1,
                message: '分类不存在'
            });
        }
        res.json({
            code: 0,
            data: category,
            message: '更新成功'
        });
    } catch (error) {
        console.error('更新分类失败:', error);
        res.status(400).json({
            code: 1,
            message: error.message
        });
    }
});

// 删除分类
router.delete('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({
                code: 1,
                message: '分类不存在'
            });
        }
        res.json({
            code: 0,
            message: '删除成功'
        });
    } catch (error) {
        console.error('删除分类失败:', error);
        res.status(400).json({
            code: 1,
            message: error.message
        });
    }
});

// 批量删除分类
router.post('/categories/batch-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                code: 1,
                message: '请选择要删除的分类'
            });
        }

        // 检查是否有工具使用这些分类
        const toolCount = await Tool.countDocuments({
            category: { $in: ids.map(id => mongoose.Types.ObjectId(id)) }
        });

        if (toolCount > 0) {
            return res.status(400).json({
                code: 1,
                message: '选中的分类中有正在使用的，无法删除'
            });
        }

        const result = await Category.deleteMany({ _id: { $in: ids } });
        
        res.json({
            code: 0,
            data: { deletedCount: result.deletedCount },
            message: `成功删除 ${result.deletedCount} 个分类`
        });
    } catch (error) {
        console.error('批量删除分类失败:', error);
        res.status(400).json({
            code: 1,
            message: error.message
        });
    }
});

// 批量更新分类状态
router.post('/categories/batch-update-status', async (req, res) => {
    try {
        const { ids, status } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                code: 1,
                message: '请选择要更新的分类'
            });
        }

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                code: 1,
                message: '无效的状态值'
            });
        }

        const result = await Category.updateMany(
            { _id: { $in: ids } },
            { $set: { status } }
        );

        res.json({
            code: 0,
            data: { modifiedCount: result.modifiedCount },
            message: `成功更新 ${result.modifiedCount} 个分类的状态`
        });
    } catch (error) {
        console.error('批量更新分类状态失败:', error);
        res.status(400).json({
            code: 1,
            message: error.message
        });
    }
});

// 更新分类排序
router.post('/categories/reorder', async (req, res) => {
    try {
        const { orders } = req.body;
        if (!Array.isArray(orders)) {
            return res.status(400).json({
                code: 1,
                message: '无效的排序数据'
            });
        }

        // 使用事务确保排序更新的原子性
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            for (const { id, weight } of orders) {
                await Category.findByIdAndUpdate(id, { weight });
            }
        });
        
        await session.endSession();

        res.json({
            code: 0,
            message: '排序更新成功'
        });
    } catch (error) {
        console.error('更新分类排序失败:', error);
        res.status(400).json({
            code: 1,
            message: error.message
        });
    }
});

module.exports = router; 