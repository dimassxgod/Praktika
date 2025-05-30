
/**
 * FitApp - server/routes/auth.js
 * Роуты для авторизации и аутентификации
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Публичные роуты (не требуют авторизации)
router.post('/register', 
    auth.logAuthAttempt,
    auth.rateLimitAuth,
    authController.register
);

router.post('/login', 
    auth.logAuthAttempt,
    auth.rateLimitAuth,
    authController.login
);

router.post('/reset-password', authController.resetPassword);

router.post('/reset-password-confirm', authController.confirmResetPassword);

// Защищенные роуты (требуют авторизации)
router.get('/profile', auth.authenticateToken, authController.getProfile);

router.put('/profile', auth.authenticateToken, authController.updateProfile);

// Проверка токена
router.get('/verify-token', auth.authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Токен действителен',
        user: req.user
    });
});

// Выход (опционально, для логирования)
router.post('/logout', auth.authenticateToken, (req, res) => {
    // В случае с JWT токенами, логаут происходит на клиенте
    // Здесь можно добавить логирование или инвалидацию токена
    console.log(`User ${req.user.id} logged out at ${new Date().toISOString()}`);
    
    res.json({
        success: true,
        message: 'Выход выполнен успешно'
    });
});

module.exports = router;