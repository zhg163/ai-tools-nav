require('dotenv').config();
const mongoose = require('mongoose');

async function dropDatabase(dbName) {
    const uri = `mongodb://localhost:27017/${dbName}`;
    try {
        console.log(`准备删除数据库: ${dbName}`);
        await mongoose.connect(uri);
        
        // 在删除之前显示数据库信息
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`数据库 ${dbName} 包含以下集合:`, collections.map(c => c.name));
        
        // 确认当前数据库不是 ai-tools-nav
        if (dbName === 'ai-tools-nav') {
            console.log('跳过当前使用的数据库');
            return;
        }
        
        // 删除数据库
        await mongoose.connection.db.dropDatabase();
        console.log(`成功删除数据库: ${dbName}`);
        
    } catch (error) {
        console.error(`删除数据库 ${dbName} 失败:`, error);
    } finally {
        await mongoose.disconnect();
    }
}

async function cleanDatabases() {
    const databasesToDelete = ['ai-tools', 'ai_tools'];
    
    console.log('当前使用的数据库是: ai-tools-nav');
    console.log('准备删除以下数据库:', databasesToDelete);
    
    for (const db of databasesToDelete) {
        await dropDatabase(db);
    }
    
    console.log('\n清理完成！');
}

// 添加确认提示
console.log('⚠️ 警告：此操作将删除数据库！');
console.log('确保已经备份了重要数据。');
console.log('按 Ctrl+C 取消操作，或等待 5 秒后继续...');

setTimeout(cleanDatabases, 5000); 