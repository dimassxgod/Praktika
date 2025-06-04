const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    console.log('🔍 Проверка токена:', token ? 'Токен получен' : 'Токен отсутствует');
    
    if (!token) {
        console.log('❌ Токен не предоставлен');
        return res.status(401).json({
            status: 'error',
            message: 'Токен доступа не предоставлен'
        });
    }
    
    // Если используете JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('❌ Невалидный токен:', err.message);
            return res.status(403).json({
                status: 'error',
                message: 'Невалидный токен'
            });
        }
        
        console.log('✅ Токен валиден, пользователь:', user);
        req.user = user;
        next();
    });
};

// Альтернативный вариант без JWT (простая проверка)
const simpleAuthenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('🔍 Простая проверка токена:', token ? 'Токен получен' : 'Токен отсутствует');
    
    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Токен доступа не предоставлен'
        });
    }
    
    // Простая проверка - токен должен быть не пустым
    if (token.length > 0) {
        console.log('✅ Простая аутентификация пройдена');
        req.user = { token }; // Минимальная информация о пользователе
        next();
    } else {
        return res.status(403).json({
            status: 'error',
            message: 'Невалидный токен'
        });
    }
};

module.exports = {
    authenticateToken,
    simpleAuthenticateToken
};