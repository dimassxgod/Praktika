const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Регистрация нового пользователя
router.post('/register', userController.registerUser);

// Вход пользователя
router.post('/login', userController.loginUser);

module.exports = router;
