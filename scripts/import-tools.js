const mongoose = require('mongoose');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { Tool, Category } = require('../models');
require('dotenv').config();

async function importTools() {
    try {
        // 连接数据库
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('数据库连接成功');

        // 读取 HTML 文件
        const htmlContent = await fs.readFile(path.join(__dirname, '../index.html'), 'utf-8');
        const $ = cheerio.load(htmlContent);

        // 创建分类映射
        const categoryMap = {
            'ai-writing': '写作工具',
            'ai-drawing': '绘画工具',
            'ai-video': '视频工具',
            'ai-office': '办公工具',
            'ai-coding': '编程工具',
            'ai-chat': '聊天工具',
            'ai-search': '搜索工具'
        };

        // 获取或创建分类
        const categories = {};
        for (const [code, name] of Object.entries(categoryMap)) {
            const category = await Category.findOneAndUpdate(
                { code: code.replace('ai-', '') },
                { 
                    name,
                    code: code.replace('ai-', ''),
                    status: 'active'
                },
                { upsert: true, new: true }
            );
            categories[code] = category._id;
        }

        // 解析工具卡片
        const tools = [];
        $('.tool-card').each((index, element) => {
            const $card = $(element);
            const name = $card.find('h3').text().trim();
            const description = $card.find('.tool-desc').text().trim();
            const url = $card.find('.visit-btn').attr('href');
            const categoryTag = $card.find('.category-tag').attr('class').split(' ')[1];
            const pricing = $card.find('.tag').text().trim() === '免费' ? 'free' : 'paid';

            tools.push({
                name,
                description,
                url,
                category: categories[categoryTag],
                pricing,
                status: 'active',
                weight: index
            });
        });

        console.log(`解析到 ${tools.length} 个工具`);

        // 批量插入工具
        for (const tool of tools) {
            await Tool.findOneAndUpdate(
                { name: tool.name },
                tool,
                { upsert: true, new: true }
            );
            console.log(`导入工具: ${tool.name}`);
        }

        console.log('工具导入完成');

    } catch (error) {
        console.error('导入失败:', error);
    } finally {
        await mongoose.disconnect();
    }
}

importTools(); 