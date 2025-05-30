const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth'); // Изменено с authenticateJWT на authenticateToken
const { getUser, getWorkouts } = require('../controllers/profileController');

// Получить данные пользователя
router.get('/user', authenticateToken, getUser);

// Получить список тренировок
router.get('/workouts', authenticateToken, getWorkouts);

module.exports = router;