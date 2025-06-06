const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

// Путь к JSON файлу с пользователями
const USERS_DB_PATH = path.join(__dirname, '../data/users.json');

/**
 * Утилиты для работы с JSON базой данных пользователей
 */
class UserDatabase {
    constructor(filePath) {
        this.filePath = filePath;
        this.ensureFileExists();
    }

    async ensureFileExists() {
        try {
            await fs.access(this.filePath);
        } catch (error) {
            // Создаем директорию если не существует
            const dir = path.dirname(this.filePath);
            await fs.mkdir(dir, { recursive: true });
            
            // Создаем пустой файл с массивом пользователей
            await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
        }
    }

    async readUsers() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading users database:', error);
            return [];
        }
    }

    async writeUsers(users) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(users, null, 2));
        } catch (error) {
            console.error('Error writing users database:', error);
            throw error;
        }
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Получение пользователя по email
    async getUserByEmail(email) {
        const users = await this.readUsers();
        return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    }

    // Создание нового пользователя
    async createUser(userData) {
        const users = await this.readUsers();
        
        const newUser = {
            id: this.generateId(),
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: userData.password,
            phone: userData.phone || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            role: 'user'
        };

        users.push(newUser);
        await this.writeUsers(users);
        
        return newUser.id;
    }

    // Получение всех пользователей
    async getAllUsers() {
        const users = await this.readUsers();
        // Возвращаем пользователей без паролей для безопасности
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    // Получение пользователя по ID
    async getUserById(id) {
        const users = await this.readUsers();
        return users.find(user => user.id === id) || null;
    }

    // Обновление пользователя
    async updateUser(id, updateData) {
        const users = await this.readUsers();
        const userIndex = users.findIndex(user => user.id === id);
        
        if (userIndex === -1) {
            return null;
        }

        users[userIndex] = {
            ...users[userIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        await this.writeUsers(users);
        return users[userIndex];
    }

    // Удаление пользователя
    async deleteUser(id) {
        const users = await this.readUsers();
        const filteredUsers = users.filter(user => user.id !== id);
        
        if (filteredUsers.length === users.length) {
            return false; // Пользователь не найден
        }

        await this.writeUsers(filteredUsers);
        return true;
    }
}

// Инициализация базы данных
const userDB = new UserDatabase(USERS_DB_PATH);

// Регистрация нового пользователя
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Валидация входных данных
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Имя, email и пароль обязательны для заполнения' 
            });
        }

        // Простая валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Некорректный формат email' 
            });
        }

        // Валидация пароля (минимум 6 символов)
        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Пароль должен содержать минимум 6 символов' 
            });
        }

        // Проверка на существующего пользователя
        const existingUser = await userDB.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Пользователь с таким email уже существует.' 
            });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = await userDB.createUser({
            name: name.trim(),
            email: email.trim(),
            password: hashedPassword,
            phone: phone ? phone.trim() : null
        });

        res.status(201).json({ 
            message: 'Регистрация прошла успешно', 
            userId,
            success: true
        });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

// Аутентификация пользователя
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Валидация входных данных
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email и пароль обязательны для заполнения' 
            });
        }

        const user = await userDB.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ 
                message: 'Неправильний email чи пароль' 
            });
        }

        // Проверка активности пользователя
        if (!user.isActive) {
            return res.status(403).json({ 
                message: 'Аккаунт заблокирован. Обратитесь к администратору' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Неправильний email чи пароль' 
            });
        }

        // Обновляем время последнего входа
        await userDB.updateUser(user.id, {
            lastLogin: new Date().toISOString()
        });

        // Возвращаем данные пользователя без пароля
        const { password: _, ...userWithoutPassword } = user;

        // Здесь можно добавить генерацию JWT токена
        res.status(200).json({ 
            message: 'Успешный вход', 
            user: userWithoutPassword,
            success: true
        });
    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

// Получение всех пользователей (например, для админки)
const getAllUsers = async (req, res) => {
    try {
        const users = await userDB.getAllUsers();
        res.status(200).json({
            success: true,
            users,
            count: users.length
        });
    } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

// Получение пользователя по ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await userDB.getUserById(id);
        if (!user) {
            return res.status(404).json({ 
                message: 'Пользователь не найден',
                success: false 
            });
        }

        // Возвращаем пользователя без пароля
        const { password, ...userWithoutPassword } = user;
        
        res.status(200).json({
            success: true,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

// Обновление профиля пользователя
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email } = req.body;

        const user = await userDB.getUserById(id);
        if (!user) {
            return res.status(404).json({ 
                message: 'Пользователь не найден',
                success: false 
            });
        }

        const updateData = {};
        
        if (name) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
        
        // Если обновляется email, проверяем уникальность
        if (email && email !== user.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    message: 'Некорректный формат email',
                    success: false 
                });
            }

            const existingUser = await userDB.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ 
                    message: 'Пользователь с таким email уже существует',
                    success: false 
                });
            }
            updateData.email = email.toLowerCase().trim();
        }

        const updatedUser = await userDB.updateUser(id, updateData);
        
        // Возвращаем пользователя без пароля
        const { password, ...userWithoutPassword } = updatedUser;

        res.status(200).json({
            success: true,
            message: 'Профиль обновлен успешно',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

// Удаление пользователя
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await userDB.deleteUser(id);
        if (!deleted) {
            return res.status(404).json({ 
                message: 'Пользователь не найден',
                success: false 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Пользователь удален успешно'
        });
    } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

// Изменение пароля пользователя
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Текущий пароль и новый пароль обязательны',
                success: false 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'Новый пароль должен содержать минимум 6 символов',
                success: false 
            });
        }

        const user = await userDB.getUserById(id);
        if (!user) {
            return res.status(404).json({ 
                message: 'Пользователь не найден',
                success: false 
            });
        }

        // Проверяем текущий пароль
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ 
                message: 'Невірний поточний пароль',
                success: false 
            });
        }

        // Хешируем новый пароль
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await userDB.updateUser(id, {
            password: hashedNewPassword
        });

        res.status(200).json({
            success: true,
            message: 'Пароль изменен успешно'
        });
    } catch (error) {
        console.error('Ошибка при изменении пароля:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changePassword
};