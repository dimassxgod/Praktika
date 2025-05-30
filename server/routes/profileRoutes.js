const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const { getUser, getWorkouts } = require('../controllers/profileController');

// Получить данные пользователя
router.get('/user', authenticateJWT, getUser);

// Получить список тренировок
router.get('/workouts', authenticateJWT, getWorkouts);

module.exports = router;