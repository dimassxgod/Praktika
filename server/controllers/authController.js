/**
 * FitApp - server/controllers/authController.js
 * Контроллер для обработки запросов авторизации (JSON Database)
 */

const fs = require('fs').promises;
const path = require('path');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Путь к JSON файлу с пользователями
const USERS_DB_PATH = path.join(__dirname, '../data/users.json');

/**
 * Утилиты для работы с JSON базой данных
 */
class JSONDatabase {
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

    async findOne(query) {
        const users = await this.readUsers();
        return users.find(user => {
            return Object.keys(query).every(key => {
                if (key === 'resetPasswordExpiry' && query[key].$gt) {
                    return new Date(user[key]) > query[key].$gt;
                }
                return user[key] === query[key];
            });
        }) || null;
    }

    async findById(id) {
        const users = await this.readUsers();
        return users.find(user => user.id === id) || null;
    }

    async save(user) {
        const users = await this.readUsers();
        
        if (user.id) {
            // Обновление существующего пользователя
            const index = users.findIndex(u => u.id === user.id);
            if (index !== -1) {
                users[index] = { ...users[index], ...user };
            }
        } else {
            // Создание нового пользователя
            user.id = this.generateId();
            users.push(user);
        }
        
        await this.writeUsers(users);
        return user;
    }

    async findByIdAndUpdate(id, updateData, options = {}) {
        const users = await this.readUsers();
        const index = users.findIndex(user => user.id === id);
        
        if (index === -1) {
            return null;
        }
        
        users[index] = { ...users[index], ...updateData };
        await this.writeUsers(users);
        
        return options.new ? users[index] : users[index];
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
}

// Инициализация базы данных
const db = new JSONDatabase(USERS_DB_PATH);

/**
 * Регистрация нового пользователя
 * POST /api/auth/register
 */
async function register(req, res) {
    try {
        const { name, email, phone, password } = req.body;
        
        // Валидация входных данных
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Имя, email и пароль обязательны для заполнения'
            });
        }
        
        if (!auth.isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный формат email'
            });
        }
        
        if (!auth.isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Пароль должен содержать минимум 8 символов, буквы и цифры'
            });
        }
        
        if (phone && !auth.isValidPhone(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный формат номера телефона'
            });
        }
        
        // Проверка на существование пользователя
        const existingUser = await db.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Пользователь с таким email уже существует'
            });
        }
        
        // Хеширование пароля
        const hashedPassword = await auth.hashPassword(password);
        
        // Создание нового пользователя
        const newUser = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim() : null,
            password: hashedPassword,
            role: 'user',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            resetPasswordToken: null,
            resetPasswordExpiry: null
        };
        
        const savedUser = await db.save(newUser);
        
        // Генерация токена
        const token = auth.generateToken(savedUser);
        
        // Отправка приветственного email (опционально)
        try {
            await sendWelcomeEmail(savedUser.email, savedUser.name);
        } catch (emailError) {
            console.error('Welcome email error:', emailError);
            // Не прерываем регистрацию из-за ошибки email
        }
        
        res.status(201).json({
            success: true,
            message: 'Регистрация прошла успешно',
            token,
            user: auth.sanitizeUser(savedUser)
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при регистрации'
        });
    }
}

/**
 * Вход пользователя
 * POST /api/auth/login
 */
async function login(req, res) {
    try {
        const { email, password, rememberMe } = req.body;
        
        // Валидация входных данных
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email и пароль обязательны для заполнения'
            });
        }
        
        if (!auth.isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный формат email'
            });
        }
        
        // Поиск пользователя
        const user = await db.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }
        
        // Проверка активности аккаунта
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Аккаунт заблокирован. Обратитесь к администратору'
            });
        }
        
        // Проверка пароля
        const isPasswordValid = await auth.comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }
        
        // Обновление времени последнего входа
        await db.findByIdAndUpdate(user.id, { 
            lastLogin: new Date().toISOString() 
        });
        
        // Генерация токена
        const token = auth.generateToken(user);
        
        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            token,
            user: auth.sanitizeUser(user)
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при входе'
        });
    }
}

/**
 * Сброс пароля
 * POST /api/auth/reset-password
 */
async function resetPassword(req, res) {
    try {
        const { email } = req.body;
        
        // Валидация email
        if (!email || !auth.isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Введите корректный email адрес'
            });
        }
        
        // Поиск пользователя
        const user = await db.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Не раскрываем информацию о существовании пользователя
            return res.json({
                success: true,
                message: 'Если пользователь с таким email существует, инструкции отправлены на почту'
            });
        }
        
        // Генерация токена сброса
        const resetToken = auth.generateResetToken();
        const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 час
        
        // Сохранение токена в БД
        await db.findByIdAndUpdate(user.id, {
            resetPasswordToken: resetToken,
            resetPasswordExpiry: resetTokenExpiry
        });
        
        // Отправка email с инструкциями
        try {
            await sendResetPasswordEmail(user.email, user.name, resetToken);
        } catch (emailError) {
            console.error('Reset password email error:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Ошибка отправки email. Попробуйте позже'
            });
        }
        
        res.json({
            success: true,
            message: 'Инструкции по сбросу пароля отправлены на email'
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при сбросе пароля'
        });
    }
}

/**
 * Подтверждение сброса пароля
 * POST /api/auth/reset-password-confirm
 */
async function confirmResetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Токен и новый пароль обязательны'
            });
        }
        
        if (!auth.isValidPassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Пароль должен содержать минимум 8 символов, буквы и цифры'
            });
        }
        
        // Поиск пользователя по токену
        const user = await db.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: new Date() }
        });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Недействительный или истекший токен'
            });
        }
        
        // Обновление пароля
        const hashedPassword = await auth.hashPassword(newPassword);
        await db.findByIdAndUpdate(user.id, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpiry: null
        });
        
        res.json({
            success: true,
            message: 'Пароль успешно изменен'
        });
        
    } catch (error) {
        console.error('Confirm reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при изменении пароля'
        });
    }
}

/**
 * Получение профиля текущего пользователя
 * GET /api/auth/profile
 */
async function getProfile(req, res) {
    try {
        const user = await db.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        res.json({
            success: true,
            user: auth.sanitizeUser(user)
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения профиля'
        });
    }
}

/**
 * Обновление профиля пользователя
 * PUT /api/auth/profile
 */
async function updateProfile(req, res) {
    try {
        const { name, phone } = req.body;
        const userId = req.user.id;
        
        const updateData = {};
        
        if (name) updateData.name = name.trim();
        if (phone !== undefined) {
            if (phone && !auth.isValidPhone(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Некорректный формат номера телефона'
                });
            }
            updateData.phone = phone ? phone.trim() : null;
        }
        
        const updatedUser = await db.findByIdAndUpdate(userId, updateData, { new: true });
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        res.json({
            success: true,
            message: 'Профиль обновлен успешно',
            user: auth.sanitizeUser(updatedUser)
        });
        
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка обновления профиля'
        });
    }
}

/**
 * Отправка приветственного email
 */
async function sendWelcomeEmail(email, name) {
    // Настройка транспорта email (пример для Gmail)
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@fitapp.com',
        to: email,
        subject: 'Добро пожаловать в FitApp!',
        html: `
            <h2>Добро пожаловать, ${name}!</h2>
            <p>Спасибо за регистрацию в FitApp. Теперь вы можете:</p>
            <ul>
                <li>Записываться на тренировки</li>
                <li>Отслеживать свой прогресс</li>
                <li>Общаться с тренерами</li>
            </ul>
            <p>Удачных тренировок!</p>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

/**
 * Отправка email для сброса пароля
 */
async function sendResetPasswordEmail(email, name, resetToken) {
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@fitapp.com',
        to: email,
        subject: 'Сброс пароля FitApp',
        html: `
            <h2>Сброс пароля</h2>
            <p>Здравствуйте, ${name}!</p>
            <p>Вы запросили сброс пароля. Перейдите по ссылке ниже для создания нового пароля:</p>
            <p><a href="${resetUrl}">Сбросить пароль</a></p>
            <p>Ссылка действительна в течение 1 часа.</p>
            <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

module.exports = {
    register,
    login,
    resetPassword,
    confirmResetPassword,
    getProfile,
    updateProfile
};