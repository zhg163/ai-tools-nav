require('dotenv').config();
const mongoose = require('mongoose');

const Category = require('../models/category');

const initialCategories = [
    {
        name: '文本生成',
        code: 'text-generation',
        description: '用于生成各类文本内容的AI工具',
        weight: 100,
        status: 'active'
    },
    {
        name: '图像生成',
        code: 'image-generation',
        description: '用于生成和编辑图像的AI工具',
        weight: 90,
        status: 'active'
    },
    {
        name: '语音合成',
        code: 'speech-synthesis',
        description: '文本转语音和语音处理工具',
        weight: 80,
        status: 'active'
    },
    {
        name: '代码助手',
        code: 'code-assistant',
        description: '编程和开发辅助工具',
        weight: 70,
        status: 'active'
    }
];

async function migrateCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('数据库连接成功');

        // 清空现有数据
        await Category.deleteMany({});
        console.log('已清空现有分类数据');

        // 插入初始数据
        const result = await Category.insertMany(initialCategories);
        console.log(`成功插入 ${result.length} 条分类数据`);

    } catch (error) {
        console.error('迁移失败:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migrateCategories(); 