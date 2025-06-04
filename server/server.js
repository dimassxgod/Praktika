/**
 * FitApp - server.js
 * Главный файл сервера для приложения фитнес-записи
 * Переписан для работы с JSON файлами вместо MongoDB
 */

// Загрузка переменных окружения
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contentRoutes = require('./routes/contentRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Импорт промежуточного ПО
const { authenticateToken } = require('./middleware/auth');

// Инициализация JSON базы данных
const initJsonDatabase = async () => {
    const dataDir = path.join(__dirname, 'data');
    
    // Создаем папку data если её нет
    try {
        await fs.access(dataDir);
    } catch (error) {
        await fs.mkdir(dataDir, { recursive: true });
        console.log('📁 Создана папка data/');
    }
    
    // Инициализируем JSON файлы если их нет
    const jsonFiles = [
        { name: 'users.json', data: [] },
        { name: 'trainers.json', data: [] },
        { name: 'bookings.json', data: [] },
        { name: 'exercises.json', data: [] },
        { name: 'nutrition.json', data: [] },
        { name: 'profiles.json', data: [] }
    ];
    
    for (const file of jsonFiles) {
        const filePath = path.join(dataDir, file.name);
        try {
            await fs.access(filePath);
        } catch (error) {
            await fs.writeFile(filePath, JSON.stringify(file.data, null, 2));
            console.log(`📄 Создан файл ${file.name}`);
        }
    }
    
    console.log('✅ JSON база данных инициализирована');
};

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
// Папка public находится на уровень выше папки server, поэтому используем ../
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/bookings',  bookingRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/profile', authenticateToken, profileRoutes);

// Здоровье API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        database: 'JSON Files',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Эндпоинт для получения статистики базы данных
app.get('/api/database/stats', async (req, res) => {
    try {
        const dataDir = path.join(__dirname, 'data');
        const files = await fs.readdir(dataDir);
        const stats = {};
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(dataDir, file);
                const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
                stats[file.replace('.json', '')] = {
                    count: Array.isArray(data) ? data.length : Object.keys(data).length,
                    size: (await fs.stat(filePath)).size
                };
            }
        }
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Ошибка получения статистики базы данных'
        });
    }
});

// Маршруты для HTML страниц
// Используем ../ чтобы выйти из папки server в папку Praktika, где находится public
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'pages', 'index.html'));
});

app.get('/trainers', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'pages', 'trainers.html'));
});

app.get('/exercises', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'pages', 'exercises.html'));
});

app.get('/nutrition', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'pages', 'nutrition.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'pages', 'profile.html'));
});

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'pages', 'auth.html'));
});

// Обработка 404 ошибок
app.use((req, res, next) => {
    // Проверяем, что это не API запрос
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            status: 'error',
            message: 'API endpoint not found'
        });
    }
    
    // Для обычных запросов отправляем 404 страницу или перенаправляем на главную
    res.status(404).sendFile(path.join(__dirname, '../public', 'pages', 'index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('❌ Ошибка сервера:', err.stack);
    
    // Определяем статус ошибки
    const status = err.status || err.statusCode || 500;
    
    res.status(status).json({
        status: 'error',
        message: status === 500 ? 'Внутренняя ошибка сервера' : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Запуск сервера
const startServer = async () => {
    try {
        // Инициализируем JSON базу данных
        await initJsonDatabase();
        
        // Запускаем сервер
        const server = app.listen(PORT, () => {
            console.log(`🚀 Сервер запущен на порту ${PORT}`);
            console.log(`🌐 Режим: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📁 Статические файлы: ${path.join(__dirname, '../public')}`);
            console.log(`💾 База данных: JSON файлы в папке data/`);
            console.log(`🔗 Доступные маршруты:`);
            console.log(`   - http://localhost:${PORT}/`);
            console.log(`   - http://localhost:${PORT}/trainers`);
            console.log(`   - http://localhost:${PORT}/exercises`);
            console.log(`   - http://localhost:${PORT}/nutrition`);
            console.log(`   - http://localhost:${PORT}/profile`);
            console.log(`   - http://localhost:${PORT}/auth`);
            console.log('✋ Для остановки сервера нажмите Ctrl+C');
        });
        
        // Graceful shutdown
        process.on('SIGTERM', () => {
            server.close(() => {
                console.log('🔄 Сервер остановлен');
                process.exit(0);
            });
        });
        
        // Экспортируем server для graceful shutdown
        module.exports = { app, server };
        
    } catch (error) {
        console.error('❌ Ошибка запуска сервера:', error);
        process.exit(1);
    }
};

// Запускаем сервер
startServer();