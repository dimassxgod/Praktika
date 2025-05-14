/**
 * FitApp - server.js
 * Главный файл сервера для приложения фитнес-записи
 */

// Импорт необходимых модулей
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contentRoutes = require('./routes/contentRoutes');

// Импорт промежуточного ПО
const { authenticateJWT } = require('./middleware/auth');

// Импорт конфигурации базы данных
const dbConfig = require('./config/db');

// Инициализация Express приложения
const app = express();
const PORT = process.env.PORT || 3000;

// Настройка промежуточного ПО
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Подключение к базе данных MongoDB
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
.then(() => {
    console.log('Подключение к базе данных установлено');
})
.catch(err => {
    console.error('Ошибка подключения к базе данных:', err);
    process.exit(1);
});

// Настройка заголовков безопасности
app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Content-Security-Policy', "default-src 'self'");
    next();
});

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/booking', authenticateJWT, bookingRoutes); // Требуется авторизация
app.use('/api/content', contentRoutes);

// Обработка запросов к статическим страницам (SPA-подход)
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
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Режим: ${process.env.NODE_ENV || 'development'}`);
    console.log('Для остановки сервера нажмите Ctrl+C');
});

// Обработка сигналов завершения процесса
process.on('SIGINT', () => {
    console.log('Сервер остановлен');
    mongoose.connection.close(() => {
        console.log('Соединение с базой данных закрыто');
        process.exit(0);
    });
});

module.exports = app; // Экспорт для тестирования