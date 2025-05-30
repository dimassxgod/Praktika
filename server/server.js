/**
 * FitApp - server.js
 * Главный файл сервера для приложения фитнес-записи
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contentRoutes = require('./routes/contentRoutes');
const profileRoutes = require('./routes/profileRoutes'); // Новый

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

// Настройка middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Безопасность
app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Content-Security-Policy', "default-src 'self'");
    next();
});

// Подключение маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/booking', authenticateJWT, bookingRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/profile', authenticateJWT, profileRoutes); // Новый маршрут

// SPA fallback (если нет совпадений по маршрутам)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Что-то пошло не так!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🌐 Режим: ${process.env.NODE_ENV || 'development'}`);
    console.log('✋ Для остановки сервера нажмите Ctrl+C');
});

module.exports = app;
