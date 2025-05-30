/**
 * FitApp - server/middleware/auth.js
 * Серверная часть для авторизации и аутентификации
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Секретный ключ для JWT (в продакшене должен быть в переменных окружения)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 12;

/**
 * Генерация JWT токена
 * @param {Object} user - Объект пользователя
 * @returns {string} - JWT токен
 */
function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name
    };
    
    return jwt.sign(payload, JWT_SECRET, { 
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'fitapp'
    });
}

/**
 * Проверка JWT токена
 * @param {string} token - JWT токен
 * @returns {Object|null} - Декодированные данные или null
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('JWT verification error:', error.message);
        return null;
    }
}

/**
 * Хеширование пароля
 * @param {string} password - Исходный пароль
 * @returns {Promise<string>} - Хешированный пароль
 */
async function hashPassword(password) {
    try {
        return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
        console.error('Password hashing error:', error);
        throw new Error('Ошибка обработки пароля');
    }
}

/**
 * Сравнение пароля с хешем
 * @param {string} password - Исходный пароль
 * @param {string} hashedPassword - Хешированный пароль
 * @returns {Promise<boolean>} - Результат сравнения
 */
async function comparePassword(password, hashedPassword) {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
}

/**
 * Middleware для проверки аутентификации
 * @param {Object} req - Express request объект
 * @param {Object} res - Express response объект
 * @param {Function} next - Express next функция
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Токен доступа не предоставлен' 
        });
    }
    
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
        return res.status(403).json({ 
            success: false,
            message: 'Недействительный или истекший токен' 
        });
    }
    
    req.user = decodedToken;
    next();
}

/**
 * Middleware для проверки роли пользователя
 * @param {Array} allowedRoles - Разрешенные роли
 * @returns {Function} - Middleware функция
 */
function requireRole(allowedRoles) {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }
            
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Недостаточно прав доступа'
                });
            }
            
            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка проверки прав доступа'
            });
        }
    };
}

/**
 * Валидация email
 * @param {string} email - Email адрес
 * @returns {boolean} - Результат валидации
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Валидация пароля
 * @param {string} password - Пароль
 * @returns {boolean} - Результат валидации
 */
function isValidPassword(password) {
    // Минимум 8 символов, должен содержать буквы и цифры
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
}

/**
 * Валидация номера телефона
 * @param {string} phone - Номер телефона
 * @returns {boolean} - Результат валидации
 */
function isValidPhone(phone) {
    // Поддержка различных форматов телефонов
    const phoneRegex = /^(\+|[0-9])[0-9]{9,15}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
}

/**
 * Очистка пользовательских данных от конфиденциальной информации
 * @param {Object} user - Объект пользователя
 * @returns {Object} - Очищенный объект пользователя
 */
function sanitizeUser(user) {
    const { password, ...sanitizedUser } = user.toObject ? user.toObject() : user;
    return sanitizedUser;
}

/**
 * Генерация случайного токена для сброса пароля
 * @returns {string} - Случайный токен
 */
function generateResetToken() {
    return require('crypto').randomBytes(32).toString('hex');
}

/**
 * Middleware для логирования попыток входа
 * @param {Object} req - Express request объект
 * @param {Object} res - Express response объект
 * @param {Function} next - Express next функция
 */
function logAuthAttempt(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    console.log(`Auth attempt from IP: ${ip}, User-Agent: ${userAgent}, Time: ${new Date().toISOString()}`);
    
    next();
}

/**
 * Проверка лимита попыток входа (простая реализация)
 * В продакшене лучше использовать Redis или подобное решение
 */
const loginAttempts = new Map();

function rateLimitAuth(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `login_attempts_${ip}`;
    
    const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: Date.now() };
    
    // Сброс счетчика если прошло более 15 минут
    if (Date.now() - attempts.lastAttempt > 15 * 60 * 1000) {
        attempts.count = 0;
    }
    
    if (attempts.count >= 5) {
        return res.status(429).json({
            success: false,
            message: 'Слишком много попыток входа. Попробуйте позже.'
        });
    }
    
    attempts.count++;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(key, attempts);
    
    next();
}

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    authenticateToken,
    requireRole,
    isValidEmail,
    isValidPassword,
    isValidPhone,
    sanitizeUser,
    generateResetToken,
    logAuthAttempt,
    rateLimitAuth
};