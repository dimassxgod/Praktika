const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// GET-запрос на получение бронирований пользователя
router.get('/user/:user_id', bookingController.getBookingsByUser);

// POST-запрос на бронирование тренировки
router.post('/', bookingController.bookTraining);

// DELETE-запрос на отмену брони
router.delete('/:booking_id', bookingController.cancelBooking);

module.exports = router;
