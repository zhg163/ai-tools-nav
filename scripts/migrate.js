const mongoose = require('mongoose');
const { Tool, Category, Admin } = require('../models');

async function migrate() {
    try {
        // 1. 创建默认分类
        const categories = [
            { name: 'AI写作', code: 'writing', description: 'AI写作工具' },
            { name: 'AI绘画', code: 'drawing', description: 'AI绘画工具' },
            { name: 'AI视频', code: 'video', description: 'AI视频工具' },
            { name: 'AI办公', code: 'office', description: 'AI办公工具' },
            { name: 'AI编程', code: 'coding', description: 'AI编程工具' },
            { name: 'AI聊天', code: 'chat', description: 'AI聊天工具' },
            { name: 'AI搜索', code: 'search', description: 'AI搜索工具' }
        ];

        for (const category of categories) {
            await Category.findOneAndUpdate(
                { code: category.code },
                category,
                { upsert: true, new: true }
            );
        }

        // 2. 创建超级管理员
        const superAdmin = newAdmin({
            username: 'admin',
            password: 'admin123456',
            role: 'superAdmin'
        });

        await Admin.deleteOne({ username: 'admin' }); // 先删除已存在的admin
        await superAdmin.save(); // 使用save方法来触发密码加密

        // 3. 迁移现有工具数据
        const existingTools = await Tool.find({});
        for (const tool of existingTools) {
            const category = await Category.findOne({ code: tool.category });
            if (category) {
                tool.category = category._id;
                await tool.save();
            }
        }

        console.log('数据迁移完成');
    } catch (error) {
        console.error('数据迁移失败:', error);
    } finally {
        mongoose.disconnect();
    }
}

// 执行迁移
migrate();