const mongoose = require('mongoose');
const { Tool } = require('../models');
require('dotenv').config();

async function checkTools() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('数据库连接成功');

        // 检查所有工具的 pricing 字段
        const tools = await Tool.find({}, { name: 1, pricing: 1 });
        
        console.log('工具总数:', tools.length);
        console.log('pricing 字段统计:');
        const stats = tools.reduce((acc, tool) => {
            acc[tool.pricing] = (acc[tool.pricing] || 0) + 1;
            return acc;
        }, {});
        console.log(stats);

        // 检查是否有无效的 pricing 值
        const invalidTools = tools.filter(tool => !['free', 'paid'].includes(tool.pricing));
        if (invalidTools.length > 0) {
            console.log('发现无效的 pricing 值:', invalidTools);
        }

    } catch (error) {
        console.error('检查失败:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkTools(); 