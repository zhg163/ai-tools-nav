const express = require('express');
const router = express.Router();
const { Category } = require('../../models');

// 获取分类列表
router.get('/', async (req, res) => {
    try {
        const { page = 1, pageSize = 10, status } = req.query;
        const query = {};
        
        if (status) query.status = status;
        
        const total = await Category.countDocuments(query);
        const categories = await Category.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize));
            
        res.json({
            code: 0,
            data: {
                list: categories,
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

// 创建分类
router.post('/', async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).json({
            code: 0,
            data: category,
            message: '创建成功'
        });
    } catch (error) {
        res.status(400).json({
            code: 1,
            message: error.message
        });
    }
});

// 更新分类
router.put('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({
            code: 0,
            data: category,
            message: '更新成功'
        });
    } catch (error) {
        res.status(400).json({
            code: 1,
            message: error.message
        });
    }
});

// 删除分类
router.delete('/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
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

module.exports = router; 