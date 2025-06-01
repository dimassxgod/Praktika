const { MongoClient } = require('mongodb');

// URL подключения к MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitapp';

let client;
let db;

async function connectToDatabase() {
    try {
        if (!client) {
            client = new MongoClient(MONGODB_URI, {
                // Современные опции подключения
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            
            await client.connect();
            console.log('✅ Успешное подключение к MongoDB');
        }
        
        if (!db) {
            db = client.db(); // Использует имя БД из URI
        }
        
        return { client, db };
    } catch (error) {
        console.error('❌ Ошибка подключения к базе данных:', error.message);
        
        // Возвращаем заглушку в случае ошибки, чтобы сервер не падал
        return {
            db: {
                collection: () => ({
                    findOne: () => Promise.resolve(null),
                    find: () => ({
                        project: () => ({
                            sort: () => ({
                                toArray: () => Promise.resolve([])
                            })
                        })
                    }),
                    insertOne: () => Promise.resolve({ insertedId: null }),
                    updateOne: () => Promise.resolve({ modifiedCount: 0 }),
                    deleteOne: () => Promise.resolve({ deletedCount: 0 })
                })
            },
            client: {
                close: () => Promise.resolve()
            }
        };
    }
}

// Инициализация подключения
connectToDatabase().then(({ client: c, db: d }) => {
    client = c;
    db = d;
});

// Graceful shutdown
process.on('SIGINT', async () => {
    if (client) {
        await client.close();
        console.log('🔌 MongoDB соединение закрыто');
    }
    process.exit(0);
});

module.exports = { 
    get db() { return db; }, 
    get client() { return client; }, 
    connectToDatabase 
};