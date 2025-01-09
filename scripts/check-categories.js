require('dotenv').config();
const mongoose = require('mongoose');
const { Category } = require('../models');

async function checkCategories() {
    try {
        console.log('正在连接数据库:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('数据库连接成功');

        const categories = await Category.find();
        console.log('数据库中的分类数据:', {
            总数: categories.length,
            详细列表: categories.map(cat => ({
                id: cat._id,
                name: cat.name,
                code: cat.code,
                status: cat.status,
                weight: cat.weight,
                createdAt: cat.createdAt
            }))
        });

        // 显示所有集合
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('数据库中的集合:', collections.map(c => c.name));

    } catch (error) {
        console.error('查询失败:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkCategories(); 