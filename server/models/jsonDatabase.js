/**
 * JSON Database - замена MongoDB/MySQL
 * Утилиты для работы с JSON файлами как с базой данных
 */

const fs = require('fs').promises;
const path = require('path');

class JsonDatabase {
    constructor(fileName) {
        this.filePath = path.join(__dirname, '..', 'data', fileName);
        this.fileName = fileName;
    }

    /**
     * Чтение данных из JSON файла
     */
    async read() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Файл не существует, возвращаем пустой массив
                return [];
            }
            throw new Error(`Ошибка чтения файла ${this.fileName}: ${error.message}`);
        }
    }

    /**
     * Запись данных в JSON файл
     */
    async write(data) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            throw new Error(`Ошибка записи в файл ${this.fileName}: ${error.message}`);
        }
    }

    /**
     * Получить все записи
     */
    async findAll() {
        return await this.read();
    }

    /**
     * Найти запись по ID
     */
    async findById(id) {
        const data = await this.read();
        return data.find(item => item.id === id || item.id === parseInt(id));
    }

    /**
     * Найти записи по условию
     */
    async findWhere(condition) {
        const data = await this.read();
        return data.filter(item => {
            return Object.keys(condition).every(key => {
                if (typeof condition[key] === 'string' && typeof item[key] === 'string') {
                    return item[key].toLowerCase() === condition[key].toLowerCase();
                }
                return item[key] === condition[key];
            });
        });
    }

    /**
     * Найти одну запись по условию
     */
    async findOne(condition) {
        const results = await this.findWhere(condition);
        return results[0] || null;
    }

    /**
     * Создать новую запись
     */
    async create(item) {
        const data = await this.read();
        
        // Генерируем ID
        const maxId = data.length > 0 ? Math.max(...data.map(d => d.id || 0)) : 0;
        const newItem = {
            id: maxId + 1,
            ...item,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        data.push(newItem);
        await this.write(data);
        return newItem;
    }

    /**
     * Обновить запись по ID
     */
    async updateById(id, updates) {
        const data = await this.read();
        const index = data.findIndex(item => item.id === id || item.id === parseInt(id));
        
        if (index === -1) {
            return null;
        }
        
        data[index] = {
            ...data[index],
            ...updates,
            updated_at: new Date().toISOString()
        };
        
        await this.write(data);
        return data[index];
    }

    /**
     * Удалить запись по ID
     */
    async deleteById(id) {
        const data = await this.read();
        const filteredData = data.filter(item => item.id !== id && item.id !== parseInt(id));
        
        if (filteredData.length === data.length) {
            return false; // Не найдено
        }
        
        await this.write(filteredData);
        return true;
    }

    /**
     * Подсчет записей
     */
    async count(condition = null) {
        if (!condition) {
            const data = await this.read();
            return data.length;
        }
        
        const filtered = await this.findWhere(condition);
        return filtered.length;
    }

    /**
     * Сортировка
     */
    async findSorted(field, order = 'asc') {
        const data = await this.read();
        return data.sort((a, b) => {
            if (order === 'desc') {
                return b[field] > a[field] ? 1 : -1;
            }
            return a[field] > b[field] ? 1 : -1;
        });
    }

    /**
     * Пагинация
     */
    async findPaginated(page = 1, limit = 10, condition = null) {
        let data = await this.read();
        
        if (condition) {
            data = data.filter(item => {
                return Object.keys(condition).every(key => item[key] === condition[key]);
            });
        }
        
        const total = data.length;
        const offset = (page - 1) * limit;
        const items = data.slice(offset, offset + limit);
        
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
}

/**
 * Фабрика для создания экземпляров JsonDatabase
 */
const createDatabase = (fileName) => new JsonDatabase(fileName);

/**
 * Предопределенные экземпляры для основных сущностей
 */
const databases = {
    users: createDatabase('users.json'),
    trainers: createDatabase('trainers.json'),
    exercises: createDatabase('exercises.json'),
    muscleGroups: createDatabase('muscle_groups.json'),
    trainings: createDatabase('trainings.json'),
    bookings: createDatabase('bookings.json'),
    nutrition: createDatabase('nutrition.json'),
    profiles: createDatabase('profiles.json')
};

/**
 * Функция инициализации базы данных с начальными данными
 */
async function initializeDatabase() {
    try {
        // Проверяем и создаем папку data
        const dataDir = path.join(__dirname, '..', 'data');
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
        }

        // Инициализируем группы мышц, если их нет
        const muscleGroups = await databases.muscleGroups.findAll();
        if (muscleGroups.length === 0) {
            const defaultMuscleGroups = [
                { name: 'Грудь', description: 'Грудные мышцы' },
                { name: 'Спина', description: 'Мышцы спины' },
                { name: 'Ноги', description: 'Мышцы ног' },
                { name: 'Плечи', description: 'Дельтовидные мышцы' },
                { name: 'Руки', description: 'Бицепсы и трицепсы' },
                { name: 'Пресс', description: 'Мышцы пресса' }
            ];

            for (const group of defaultMuscleGroups) {
                await databases.muscleGroups.create(group);
            }
            console.log('✅ Инициализированы группы мышц');
        }

        console.log('✅ JSON база данных готова к работе');
    } catch (error) {
        console.error('❌ Ошибка инициализации базы данных:', error);
        throw error;
    }
}

module.exports = {
    JsonDatabase,
    createDatabase,
    databases,
    initializeDatabase
};