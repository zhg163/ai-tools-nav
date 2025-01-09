require('dotenv').config();
const mongoose = require('mongoose');

async function checkDatabase(dbName) {
    const uri = `mongodb://localhost:27017/${dbName}`;
    try {
        await mongoose.connect(uri);
        console.log(`\n=== 检查数据库 ${dbName} ===`);
        
        // 获取所有集合
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('集合列表:', collections.map(c => c.name));
        
        // 检查每个集合的内容
        for (const collection of collections) {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            const sample = await mongoose.connection.db.collection(collection.name)
                .find({})
                .limit(1)
                .toArray();
            
            console.log(`\n${collection.name} 集合:`);
            console.log(`- 文档数量: ${count}`);
            console.log('- 样本数据:', sample[0]);
        }
        
    } catch (error) {
        console.error(`检查数据库 ${dbName} 失败:`, error);
    } finally {
        await mongoose.disconnect();
    }
}

async function checkAllDatabases() {
    const databases = ['ai-tools', 'ai_tools', 'ai-tools-nav'];
    for (const db of databases) {
        await checkDatabase(db);
    }
}

checkAllDatabases(); 