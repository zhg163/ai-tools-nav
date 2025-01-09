const mongoose = require('mongoose');
const Tool = require('../models/tool');
require('dotenv').config();

async function migratePricing() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('数据库连接成功');

        // 更新所有工具的 pricing 字段
        const result = await Tool.updateMany(
            { isFree: { $exists: true } },
            [
                {
                    $set: {
                        pricing: {
                            $cond: {
                                if: '$isFree',
                                then: 'free',
                                else: 'paid'
                            }
                        }
                    }
                },
                {
                    $unset: 'isFree'
                }
            ]
        );

        console.log(`迁移完成，更新了 ${result.modifiedCount} 条数据`);
    } catch (error) {
        console.error('迁移失败:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migratePricing(); 