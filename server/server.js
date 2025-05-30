/**
 * FitApp - server.js
 * Главный файл сервера для приложения фитнес-записи
 */

// Загрузка переменных окружения
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contentRoutes = require('./routes/contentRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Импорт промежуточного ПО
const { authenticateJWT } = require('./middleware/auth');

// Импорт и подключение базы данных
const db = require('./config/db');

// Проверка подключения к БД
db.getConnection((err, connection) => {
    if (err) {
        console.error('Ошибка подключения к MySQL:', err.message);
        process.exit(1);
    }
    console.log('✅ Подключено к базе данных MySQL');
    connection.release();
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для безопасности
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов с одного IP
    message: {
        error: 'Слишком много запросов с этого IP, попробуйте позже.'
    }
});

app.use(limiter);

// Основные middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/booking', authenticateJWT, bookingRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/profile', authenticateJWT, profileRoutes);

// Здоровье API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// SPA fallback - должен быть последним
app.get('*', (req, res) => {
    // Проверяем, что это не API запрос
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            status: 'error',
            message: 'API endpoint not found'
        });
    }
    
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Определяем статус ошибки
    const status = err.status || err.statusCode || 500;
    
    res.status(status).json({
        status: 'error',
        message: status === 500 ? 'Внутренняя ошибка сервера' : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM получен. Закрываем HTTP сервер...');
    server.close(() => {
        console.log('HTTP сервер закрыт.');
        db.end(() => {
            console.log('База данных отключена.');
            process.exit(0);
        });
    });
});

// Запуск сервера
const server = app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🌐 Режим: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Статические файлы: ${path.join(__dirname, '../public')}`);
    console.log('✋ Для остановки сервера нажмите Ctrl+C');
});

module.exports = app;