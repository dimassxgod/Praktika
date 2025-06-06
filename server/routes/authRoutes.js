const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const DATA_PATH = path.join(__dirname, '../data/users.json');

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, passwordConfirm } = req.body;

        // Валидация
        if (!name || !email || !password || !passwordConfirm) {
            return res.status(400).json({ error: 'Пожалуйста, заполните все обязательные поля' });
        }

        if (password !== passwordConfirm) {
            return res.status(400).json({ error: 'Пароли не совпадают' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов' });
        }

        // Проверка существующего пользователя
        const users = JSON.parse(await fs.readFile(DATA_PATH, 'utf8'));
        const existingUser = users.find(user => user.email === email);

        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание нового пользователя
        const newUser = {
            id: uuidv4(),
            name,
            email,
            phone: phone || null,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            role: 'user'
        };

        users.push(newUser);
        await fs.writeFile(DATA_PATH, JSON.stringify(users, null, 2));

        // Создание JWT токена
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Ошибка сервера при регистрации' });
    }
});

// Вход пользователя
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Валидация
        if (!email || !password) {
            return res.status(400).json({ error: 'Будь ласка, вкажіть email і пароль' });
        }

        // Поиск пользователя
        const users = JSON.parse(await fs.readFile(DATA_PATH, 'utf8'));
        const user = users.find(user => user.email === email);

        if (!user) {
            return res.status(401).json({ error: 'Неправильний email або пароль' });
        }

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Неправильний email або пароль' });
        }

        // Создание JWT токена
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Успішний вхід у систему',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: 'Ошибка сервера при входе' });
    }
});

// Получение информации о текущем пользователе
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // Верификация токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Поиск пользователя
        const users = JSON.parse(await fs.readFile(DATA_PATH, 'utf8'));
        const user = users.find(u => u.id === decoded.userId);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Возвращаем данные пользователя без пароля
        const { password, ...userData } = user;
        res.json(userData);

    } catch (error) {
        console.error('Ошибка получения данных пользователя:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Недействительный токен' });
        }
        res.status(500).json({ error: 'Ошибка сервера при получении данных пользователя' });
    }
});

// Восстановление пароля (упрощенная версия)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Пожалуйста, укажите email' });
        }

        // Проверка существования пользователя
        const users = JSON.parse(await fs.readFile(DATA_PATH, 'utf8'));
        const user = users.find(user => user.email === email);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь с таким email не найден' });
        }

        // В реальном приложении здесь должна быть отправка email с токеном сброса
        // Для демонстрации просто возвращаем успешный ответ
        res.json({ 
            message: 'Если email зарегистрирован, на него отправлена инструкция по сбросу пароля',
            // В реальном приложении не возвращаем токен клиенту
            // resetToken: 'demo-reset-token' 
        });

    } catch (error) {
        console.error('Ошибка восстановления пароля:', error);
        res.status(500).json({ error: 'Ошибка сервера при восстановлении пароля' });
    }
});

module.exports = router;