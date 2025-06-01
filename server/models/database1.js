const { MongoClient } = require('mongodb');

// Конфигурация подключения к MongoDB
const mongoConfig = {
    url: 'mongodb://localhost:27017',
    dbName: 'fitapp',
    options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    }
};

let client;
let db;

// Функция для подключения к MongoDB
async function connectToMongoDB() {
    try {
        client = new MongoClient(mongoConfig.url, mongoConfig.options);
        await client.connect();
        db = client.db(mongoConfig.dbName);
        
        // Проверяем подключение
        await client.db('admin').command({ ping: 1 });
        console.log('✅ Подключение к MongoDB установлено');
        return db;
    } catch (error) {
        console.error('❌ Ошибка подключения к MongoDB:', error.message);
        throw error;
    }
}

// Функция для получения базы данных
function getDatabase() {
    if (!db) {
        throw new Error('База данных не подключена. Вызовите connectToMongoDB() сначала.');
    }
    return db;
}

// Функция для получения коллекции
function getCollection(collectionName) {
    const database = getDatabase();
    return database.collection(collectionName);
}

// Функция для закрытия соединения
async function closeConnection() {
    if (client) {
        await client.close();
        console.log('🔌 Соединение с MongoDB закрыто');
    }
}

// Обработка завершения процесса
process.on('SIGINT', async () => {
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeConnection();
    process.exit(0);
});

// Инициализация подключения при загрузке модуля
connectToMongoDB().catch(console.error);

module.exports = {
    connectToMongoDB,
    getDatabase,
    getCollection,
    closeConnection
};