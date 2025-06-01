// server/controllers/profileController.js
//const { db } = require('../config/db');
const { ObjectId } = require('mongodb');

async function getUser(req, res) {
    try {
        const userId = req.user.id;
        
        // Проверяем, что userId является валидным ObjectId
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Неверный ID пользователя' });
        }

        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { name: 1, email: 1, age: 1 } }
        );

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(user);
    } catch (err) {
        console.error('Ошибка при получении пользователя:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

async function getWorkouts(req, res) {
    try {
        const userId = req.user.id;
        
        // Проверяем, что userId является валидным ObjectId
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Неверный ID пользователя' });
        }

        const workouts = await db.collection('workouts')
            .find({ userId: new ObjectId(userId) })
            .project({ date: 1, type: 1 })
            .sort({ date: -1 })
            .toArray();

        res.json(workouts);
    } catch (err) {
        console.error('Ошибка при получении тренировок:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

module.exports = {
    getUser,
    getWorkouts
};