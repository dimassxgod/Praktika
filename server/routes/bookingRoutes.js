const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Создать новую запись на тренировку
router.post('/', bookingController.bookTraining);

// Получить все записи пользователя по ID
router.get('/:userId', bookingController.getUserBookings);

module.exports = router;
