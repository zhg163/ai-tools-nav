require('dotenv').config();
const mongoose = require('mongoose');
const { Tool, Category } = require('../models');

// 工具数据
const toolsData = [
    {
        name: "Midjourney",
        description: "AI绘画和图像生成工具",
        url: "https://www.midjourney.com",
        category: "drawing",
        pricing: "paid",
        status: "active"
    },
    {
        name: "Stable Diffusion",
        description: "开源的AI图像生成模型",
        url: "https://stability.ai",
        category: "drawing",
        pricing: "free",
        status: "active"
    },
    {
        name: "ChatGPT",
        description: "OpenAI开发的AI对话模型",
        url: "https://chat.openai.com",
        category: "writing",
        pricing: "free",
        status: "active"
    },
    {
        name: "Claude",
        description: "Anthropic开发的AI助手",
        url: "https://claude.ai",
        category: "writing",
        pricing: "free",
        status: "active"
    },
    {
        name: "Runway",
        description: "AI视频处理和生成工具",
        url: "https://runway.ml",
        category: "video",
        pricing: "paid",
        status: "active"
    },
    {
        name: "Descript",
        description: "AI视频和音频编辑工具",
        url: "https://www.descript.com",
        category: "video",
        pricing: "paid",
        status: "active"
    },
    {
        name: "Murf",
        description: "AI语音生成工具",
        url: "https://murf.ai",
        category: "audio",
        pricing: "paid",
        status: "active"
    },
    {
        name: "Notion AI",
        description: "集成AI功能的笔记和协作工具",
        url: "https://www.notion.so",
        category: "office",
        pricing: "paid",
        status: "active"
    }
];

async function initTools() {
    try {
        console.log('正在连接数据库...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('数据库连接成功');

        // 获取所有分类
        const categories = await Category.find();
        const categoryMap = new Map(categories.map(cat => [cat.code, cat._id]));

        console.log('现有分类:', categories.map(cat => ({
            code: cat.code,
            name: cat.name
        })));

        // 删除现有工具数据
        await Tool.deleteMany({});
        console.log('已清空工具集合');

        // 插入新工具数据
        const toolsWithCategories = toolsData.map(tool => ({
            ...tool,
            category: categoryMap.get(tool.category)
        }));

        const result = await Tool.insertMany(toolsWithCategories);
        console.log(`成功导入 ${result.length} 个工具:`);
        result.forEach(tool => {
            console.log(`- ${tool.name} (${tool.category})`);
        });

    } catch (error) {
        console.error('初始化工具数据失败:', error);
    } finally {
        await mongoose.disconnect();
        console.log('数据库连接已关闭');
    }
}

// 运行初始化
initTools(); 