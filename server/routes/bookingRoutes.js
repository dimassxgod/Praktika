const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const BOOKINGS_FILE = path.join(__dirname, '../data/bookings.json');

// POST / - Создание новой записи
router.post('/', async (req, res) => {
    try {
        const bookingData = {
            id: Date.now(), // Простой ID на основе времени
            ...req.body,
            createdAt: new Date().toISOString(),
            status: 'confirmed'
        };

        // Читаем существующие записи
        const bookingsFile = await fs.readFile(BOOKINGS_FILE, 'utf8');
        const bookings = JSON.parse(bookingsFile);

        // Добавляем новую запись
        bookings.push(bookingData);

        // Сохраняем обратно в файл
        await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));

        res.status(201).json(bookingData);
    } catch (error) {
        console.error('Ошибка создания записи:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Ошибка создания записи' 
        });
    }
});

// GET /user/:userId - Получение записей пользователя
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        const bookingsFile = await fs.readFile(BOOKINGS_FILE, 'utf8');
        const bookings = JSON.parse(bookingsFile);
        
        const userBookings = bookings.filter(booking => booking.userId === userId);
        
        res.json(userBookings);
    } catch (error) {
        console.error('Ошибка получения записей:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Ошибка получения записей' 
        });
    }
});

// DELETE /:id - Отмена записи
router.delete('/:id', async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        
        const bookingsFile = await fs.readFile(BOOKINGS_FILE, 'utf8');
        let bookings = JSON.parse(bookingsFile);
        
        const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);
        
        if (bookingIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'Запись не найдена'
            });
        }
        
        // Удаляем запись
        bookings.splice(bookingIndex, 1);
        
        // Сохраняем обратно в файл
        await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
        
        res.json({ 
            status: 'success',
            message: 'Запись отменена' 
        });
    } catch (error) {
        console.error('Ошибка отмены записи:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Ошибка отмены записи' 
        });
    }
});

module.exports = router;