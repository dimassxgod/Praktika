// server/controllers/profileController.js
const db = require('../config/db');

// Получить данные пользователя
exports.getUser = (req, res) => {
    const userId = req.user.id;

    db.query('SELECT name, email, age FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Ошибка при получении пользователя:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(results[0]);
    });
};

// Получить список тренировок
exports.getWorkouts = (req, res) => {
    const userId = req.user.id;

    db.query('SELECT date, type FROM workouts WHERE user_id = ? ORDER BY date DESC', [userId], (err, results) => {
        if (err) {
            console.error('Ошибка при получении тренировок:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        res.json(results);
    });
};