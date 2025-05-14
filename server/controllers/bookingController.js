const queries = require('../models/queries');

// Запись пользователя на тренировку
const bookTraining = async (req, res) => {
  try {
    const { user_id, training_id, date } = req.body;

    // Проверка: есть ли уже бронь
    const existing = await queries.getBookingByUserAndTraining(user_id, training_id, date);
    if (existing) {
      return res.status(400).json({ message: 'Вы уже записаны на эту тренировку.' });
    }

    const bookingId = await queries.createBooking({ user_id, training_id, date });
    res.status(201).json({ message: 'Запись успешна', bookingId });
  } catch (error) {
    console.error('Ошибка при записи на тренировку:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Отмена бронирования
const cancelBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const result = await queries.updateBookingStatus(booking_id, 'cancelled');
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }
    res.status(200).json({ message: 'Бронирование отменено' });
  } catch (error) {
    console.error('Ошибка при отмене бронирования:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение всех бронирований пользователя
const getBookingsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const bookings = await queries.getBookingsByUserId(user_id);
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  bookTraining,
  cancelBooking,
  getBookingsByUser
};
