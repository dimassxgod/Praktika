const fs = require('fs').promises;
const path = require('path');

// Пути к JSON файлам
const BOOKINGS_DB_PATH = path.join(__dirname, '../data/bookings.json');
const TRAININGS_DB_PATH = path.join(__dirname, '../data/trainings.json');

/**
 * Утилиты для работы с JSON базой данных бронирований
 */
class BookingDatabase {
    constructor(bookingsPath, trainingsPath) {
        this.bookingsPath = bookingsPath;
        this.trainingsPath = trainingsPath;
        this.ensureFilesExist();
    }

    async ensureFilesExist() {
        await this.ensureFileExists(this.bookingsPath, []);
        await this.ensureFileExists(this.trainingsPath, this.getDefaultTrainings());
    }

    async ensureFileExists(filePath, defaultData) {
        try {
            await fs.access(filePath);
        } catch (error) {
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
        }
    }

    getDefaultTrainings() {
        return [
            {
                id: "training_1",
                name: "Утренняя йога",
                description: "Спокойная практика для начала дня",
                duration: 60,
                instructor: "Анна Петрова",
                maxParticipants: 15,
                price: 800,
                category: "yoga",
                difficulty: "beginner",
                createdAt: new Date().toISOString()
            },
            {
                id: "training_2",
                name: "Силовая тренировка",
                description: "Комплексная работа с весами",
                duration: 90,
                instructor: "Михаил Иванов",
                maxParticipants: 10,
                price: 1200,
                category: "strength",
                difficulty: "intermediate",
                createdAt: new Date().toISOString()
            },
            {
                id: "training_3",
                name: "Кардио HIIT",
                description: "Высокоинтенсивная интервальная тренировка",
                duration: 45,
                instructor: "Елена Сидорова",
                maxParticipants: 20,
                price: 1000,
                category: "cardio",
                difficulty: "advanced",
                createdAt: new Date().toISOString()
            },
            {
                id: "training_4",
                name: "Растяжка и релаксация",
                description: "Мягкая растяжка для восстановления",
                duration: 75,
                instructor: "Ольга Козлова",
                maxParticipants: 12,
                price: 700,
                category: "stretching",
                difficulty: "beginner",
                createdAt: new Date().toISOString()
            }
        ];
    }

    async readBookings() {
        try {
            const data = await fs.readFile(this.bookingsPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading bookings database:', error);
            return [];
        }
    }

    async writeBookings(bookings) {
        try {
            await fs.writeFile(this.bookingsPath, JSON.stringify(bookings, null, 2));
        } catch (error) {
            console.error('Error writing bookings database:', error);
            throw error;
        }
    }

    async readTrainings() {
        try {
            const data = await fs.readFile(this.trainingsPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading trainings database:', error);
            return [];
        }
    }

    async writeTrainings(trainings) {
        try {
            await fs.writeFile(this.trainingsPath, JSON.stringify(trainings, null, 2));
        } catch (error) {
            console.error('Error writing trainings database:', error);
            throw error;
        }
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Получение бронирования по пользователю и тренировке
    async getBookingByUserAndTraining(userId, trainingId, date) {
        const bookings = await this.readBookings();
        return bookings.find(booking => 
            booking.user_id === userId && 
            booking.training_id === trainingId && 
            booking.date === date &&
            booking.status !== 'cancelled'
        ) || null;
    }

    // Создание нового бронирования
    async createBooking(bookingData) {
        const bookings = await this.readBookings();
        
        const newBooking = {
            id: this.generateId(),
            user_id: bookingData.user_id,
            training_id: bookingData.training_id,
            date: bookingData.date,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        bookings.push(newBooking);
        await this.writeBookings(bookings);
        
        return newBooking.id;
    }

    // Обновление статуса бронирования
    async updateBookingStatus(bookingId, status) {
        const bookings = await this.readBookings();
        const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);
        
        if (bookingIndex === -1) {
            return { affectedRows: 0 };
        }

        bookings[bookingIndex].status = status;
        bookings[bookingIndex].updatedAt = new Date().toISOString();
        
        await this.writeBookings(bookings);
        return { affectedRows: 1 };
    }

    // Получение всех бронирований пользователя
    async getBookingsByUserId(userId) {
        const bookings = await this.readBookings();
        const trainings = await this.readTrainings();
        
        const userBookings = bookings.filter(booking => booking.user_id === userId);
        
        // Добавляем информацию о тренировках к бронированиям
        return userBookings.map(booking => {
            const training = trainings.find(t => t.id === booking.training_id);
            return {
                ...booking,
                training: training || null
            };
        });
    }

    // Получение всех тренировок
    async getAllTrainings() {
        return await this.readTrainings();
    }

    // Получение тренировки по ID
    async getTrainingById(trainingId) {
        const trainings = await this.readTrainings();
        return trainings.find(training => training.id === trainingId) || null;
    }

    // Получение количества активных бронирований для тренировки на определенную дату
    async getActiveBookingsCount(trainingId, date) {
        const bookings = await this.readBookings();
        return bookings.filter(booking => 
            booking.training_id === trainingId && 
            booking.date === date && 
            booking.status === 'active'
        ).length;
    }

    // Получение бронирования по ID
    async getBookingById(bookingId) {
        const bookings = await this.readBookings();
        return bookings.find(booking => booking.id === bookingId) || null;
    }

    // Получение всех бронирований для админки
    async getAllBookings() {
        const bookings = await this.readBookings();
        const trainings = await this.readTrainings();
        
        return bookings.map(booking => {
            const training = trainings.find(t => t.id === booking.training_id);
            return {
                ...booking,
                training: training || null
            };
        });
    }
}

// Инициализация базы данных
const bookingDB = new BookingDatabase(BOOKINGS_DB_PATH, TRAININGS_DB_PATH);

// Запись пользователя на тренировку
const bookTraining = async (req, res) => {
    try {
        const { user_id, training_id, date } = req.body;

        // Валидация входных данных
        if (!user_id || !training_id || !date) {
            return res.status(400).json({ 
                message: 'ID пользователя, ID тренировки и дата обязательны',
                success: false 
            });
        }

        // Валидация даты
        const bookingDate = new Date(date);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        if (bookingDate < currentDate) {
            return res.status(400).json({ 
                message: 'Нельзя записаться на тренировку в прошлом',
                success: false 
            });
        }

        // Проверка существования тренировки
        const training = await bookingDB.getTrainingById(training_id);
        if (!training) {
            return res.status(404).json({ 
                message: 'Тренировка не найдена',
                success: false 
            });
        }

        // Проверка: есть ли уже бронь
        const existing = await bookingDB.getBookingByUserAndTraining(user_id, training_id, date);
        if (existing) {
            return res.status(400).json({ 
                message: 'Вы уже записаны на эту тренировку.',
                success: false 
            });
        }

        // Проверка на максимальное количество участников
        const activeBookingsCount = await bookingDB.getActiveBookingsCount(training_id, date);
        if (activeBookingsCount >= training.maxParticipants) {
            return res.status(400).json({ 
                message: 'На эту тренировку больше нет свободных мест',
                success: false 
            });
        }

        const bookingId = await bookingDB.createBooking({ user_id, training_id, date });
        
        res.status(201).json({ 
            message: 'Запись успешна', 
            bookingId,
            success: true,
            training: {
                name: training.name,
                date: date,
                instructor: training.instructor
            }
        });
    } catch (error) {
        console.error('Ошибка при записи на тренировку:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

// Отмена бронирования
const cancelBooking = async (req, res) => {
    try {
        const { booking_id } = req.params;

        if (!booking_id) {
            return res.status(400).json({ 
                message: 'ID бронирования обязателен',
                success: false 
            });
        }

        // Проверка существования бронирования
        const booking = await bookingDB.getBookingById(booking_id);
        if (!booking) {
            return res.status(404).json({ 
                message: 'Бронирование не найдено',
                success: false 
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ 
                message: 'Бронирование уже отменено',
                success: false 
            });
        }

        // Проверка: можно ли отменить (например, не менее чем за 2 часа)
        const bookingDateTime = new Date(booking.date);
        const currentTime = new Date();
        const timeDifference = bookingDateTime.getTime() - currentTime.getTime();
        const hoursUntilTraining = timeDifference / (1000 * 3600);

        if (hoursUntilTraining < 2) {
            return res.status(400).json({ 
                message: 'Отмена бронирования возможна не менее чем за 2 часа до тренировки',
                success: false 
            });
        }

        const result = await bookingDB.updateBookingStatus(booking_id, 'cancelled');
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: 'Бронирование не найдено',
                success: false 
            });
        }

        res.status(200).json({ 
            message: 'Бронирование отменено',
            success: true 
        });
    } catch (error) {
        console.error('Ошибка при отмене бронирования:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

// Получение всех бронирований пользователя
const getBookingsByUser = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!user_id) {
            return res.status(400).json({ 
                message: 'ID пользователя обязателен',
                success: false 
            });
        }

        const bookings = await bookingDB.getBookingsByUserId(user_id);
        
        res.status(200).json({
            success: true,
            bookings,
            count: bookings.length
        });
    } catch (error) {
        console.error('Ошибка при получении бронирований:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

// Получение всех тренировок
const getAllTrainings = async (req, res) => {
    try {
        const trainings = await bookingDB.getAllTrainings();
        
        // Добавляем информацию о доступности для каждой тренировки
        const trainingsWithAvailability = await Promise.all(
            trainings.map(async (training) => {
                // Для примера берем сегодняшнюю дату
                const today = new Date().toISOString().split('T')[0];
                const activeBookings = await bookingDB.getActiveBookingsCount(training.id, today);
                
                return {
                    ...training,
                    availableSpots: training.maxParticipants - activeBookings,
                    isFullyBooked: activeBookings >= training.maxParticipants
                };
            })
        );
        
        res.status(200).json({
            success: true,
            trainings: trainingsWithAvailability,
            count: trainingsWithAvailability.length
        });
    } catch (error) {
        console.error('Ошибка при получении тренировок:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

// Получение конкретной тренировки по ID
const getTrainingById = async (req, res) => {
    try {
        const { training_id } = req.params;

        if (!training_id) {
            return res.status(400).json({ 
                message: 'ID тренировки обязателен',
                success: false 
            });
        }

        const training = await bookingDB.getTrainingById(training_id);
        
        if (!training) {
            return res.status(404).json({ 
                message: 'Тренировка не найдена',
                success: false 
            });
        }

        res.status(200).json({
            success: true,
            training
        });
    } catch (error) {
        console.error('Ошибка при получении тренировки:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

// Получение всех бронирований (для админки)
const getAllBookings = async (req, res) => {
    try {
        const bookings = await bookingDB.getAllBookings();
        
        res.status(200).json({
            success: true,
            bookings,
            count: bookings.length
        });
    } catch (error) {
        console.error('Ошибка при получении всех бронирований:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

// Получение статистики бронирований
const getBookingStats = async (req, res) => {
    try {
        const allBookings = await bookingDB.getAllBookings();
        const trainings = await bookingDB.getAllTrainings();
        
        const stats = {
            totalBookings: allBookings.length,
            activeBookings: allBookings.filter(b => b.status === 'active').length,
            cancelledBookings: allBookings.filter(b => b.status === 'cancelled').length,
            totalTrainings: trainings.length,
            popularTrainings: {}
        };

        // Подсчет популярности тренировок
        allBookings.forEach(booking => {
            if (booking.status === 'active') {
                const trainingName = booking.training?.name || 'Unknown';
                stats.popularTrainings[trainingName] = (stats.popularTrainings[trainingName] || 0) + 1;
            }
        });

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера',
            success: false 
        });
    }
};

module.exports = {
    bookTraining,
    cancelBooking,
    getBookingsByUser,
    getAllTrainings,
    getTrainingById,
    getAllBookings,
    getBookingStats
};