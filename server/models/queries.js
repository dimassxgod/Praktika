/**
 * Queries - функции для работы с данными
 * Переписано с MySQL/MongoDB на JSON файлы
 */

const { databases } = require('./jsonDatabase');

// === USERS ===

/**
 * Получить пользователя по email
 */
async function getUserByEmail(email) {
    try {
        const user = await databases.users.findOne({ email: email });
        return user;
    } catch (error) {
        console.error('Ошибка получения пользователя по email:', error);
        throw error;
    }
}

/**
 * Создать нового пользователя
 */
async function createUser({ name, email, password, phone }) {
    try {
        const userData = {
            name,
            email,
            password,
            phone: phone || null,
            role: 'user',
            is_active: true
        };
        
        const newUser = await databases.users.create(userData);
        return newUser.id;
    } catch (error) {
        console.error('Ошибка создания пользователя:', error);
        throw error;
    }
}

/**
 * Получить пользователя по ID
 */
async function getUserById(id) {
    try {
        return await databases.users.findById(id);
    } catch (error) {
        console.error('Ошибка получения пользователя по ID:', error);
        throw error;
    }
}

/**
 * Обновить данные пользователя
 */
async function updateUser(id, userData) {
    try {
        return await databases.users.updateById(id, userData);
    } catch (error) {
        console.error('Ошибка обновления пользователя:', error);
        throw error;
    }
}

// === TRAINERS ===

/**
 * Получить всех тренеров
 */
async function getAllTrainers() {
    try {
        return await databases.trainers.findAll();
    } catch (error) {
        console.error('Ошибка получения тренеров:', error);
        throw error;
    }
}

/**
 * Добавить тренера
 */
async function addTrainer({ name, specialization, description, experience, photo_url }) {
    try {
        const trainerData = {
            name,
            specialization,
            description: description || '',
            experience: experience || 0,
            photo_url: photo_url || null,
            rating: 5.0,
            is_active: true
        };
        
        const newTrainer = await databases.trainers.create(trainerData);
        return newTrainer.id;
    } catch (error) {
        console.error('Ошибка добавления тренера:', error);
        throw error;
    }
}

/**
 * Получить тренера по ID
 */
async function getTrainerById(id) {
    try {
        return await databases.trainers.findById(id);
    } catch (error) {
        console.error('Ошибка получения тренера:', error);
        throw error;
    }
}

// === MUSCLE GROUPS ===

/**
 * Получить все группы мышц
 */
async function getAllMuscleGroups() {
    try {
        return await databases.muscleGroups.findAll();
    } catch (error) {
        console.error('Ошибка получения групп мышц:', error);
        throw error;
    }
}

/**
 * Добавить группу мышц
 */
async function addMuscleGroup({ name, description }) {
    try {
        const groupData = {
            name,
            description: description || ''
        };
        
        const newGroup = await databases.muscleGroups.create(groupData);
        return newGroup.id;
    } catch (error) {
        console.error('Ошибка добавления группы мышц:', error);
        throw error;
    }
}

// === EXERCISES ===

/**
 * Получить все упражнения с информацией о группах мышц
 */
async function getAllExercises() {
    try {
        const exercises = await databases.exercises.findAll();
        const muscleGroups = await databases.muscleGroups.findAll();
        
        // Присоединяем информацию о группах мышц
        const exercisesWithGroups = exercises.map(exercise => {
            const muscleGroup = muscleGroups.find(group => group.id === exercise.muscle_group_id);
            return {
                ...exercise,
                muscle_group: muscleGroup ? muscleGroup.name : 'Неизвестно'
            };
        });
        
        return exercisesWithGroups;
    } catch (error) {
        console.error('Ошибка получения упражнений:', error);
        throw error;
    }
}

/**
 * Добавить упражнение
 */
async function addExercise({ name, description, muscle_group_id, gif_url, difficulty }) {
    try {
        const exerciseData = {
            name,
            description: description || '',
            muscle_group_id: parseInt(muscle_group_id),
            gif_url: gif_url || null,
            difficulty: difficulty || 'medium',
            is_active: true
        };
        
        const newExercise = await databases.exercises.create(exerciseData);
        return newExercise.id;
    } catch (error) {
        console.error('Ошибка добавления упражнения:', error);
        throw error;
    }
}

/**
 * Получить упражнения по группе мышц
 */
async function getExercisesByMuscleGroup(muscleGroupId) {
    try {
        const exercises = await databases.exercises.findWhere({ 
            muscle_group_id: parseInt(muscleGroupId) 
        });
        
        const muscleGroups = await databases.muscleGroups.findAll();
        
        // Присоединяем информацию о группе мышц
        const exercisesWithGroups = exercises.map(exercise => {
            const muscleGroup = muscleGroups.find(group => group.id === exercise.muscle_group_id);
            return {
                ...exercise,
                muscle_group: muscleGroup ? muscleGroup.name : 'Неизвестно'
            };
        });
        
        return exercisesWithGroups;
    } catch (error) {
        console.error('Ошибка получения упражнений по группе мышц:', error);
        throw error;
    }
}

// === TRAININGS ===

/**
 * Получить все тренировки с информацией о тренерах
 */
async function getAllTrainings() {
    try {
        const trainings = await databases.trainings.findAll();
        const trainers = await databases.trainers.findAll();
        
        // Присоединяем информацию о тренерах
        const trainingsWithTrainers = trainings.map(training => {
            const trainer = trainers.find(t => t.id === training.trainer_id);
            return {
                ...training,
                trainer_name: trainer ? trainer.name : 'Неизвестно'
            };
        });
        
        return trainingsWithTrainers;
    } catch (error) {
        console.error('Ошибка получения тренировок:', error);
        throw error;
    }
}

/**
 * Создать тренировку
 */
async function createTraining({ trainer_id, title, start_time, end_time, capacity, description, price }) {
    try {
        const trainingData = {
            trainer_id: parseInt(trainer_id),
            title,
            start_time,
            end_time,
            capacity: parseInt(capacity),
            description: description || '',
            price: parseFloat(price) || 0,
            current_bookings: 0,
            is_active: true
        };
        
        const newTraining = await databases.trainings.create(trainingData);
        return newTraining.id;
    } catch (error) {
        console.error('Ошибка создания тренировки:', error);
        throw error;
    }
}

/**
 * Получить тренировку по ID
 */
async function getTrainingById(id) {
    try {
        return await databases.trainings.findById(id);
    } catch (error) {
        console.error('Ошибка получения тренировки:', error);
        throw error;
    }
}

// === BOOKINGS ===

/**
 * Создать запись на тренировку
 */
async function createBooking({ user_id, training_id, date, status }) {
    try {
        // Проверяем, есть ли уже запись этого пользователя на эту тренировку
        const existingBooking = await databases.bookings.findOne({
            user_id: parseInt(user_id),
            training_id: parseInt(training_id)
        });
        
        if (existingBooking) {
            throw new Error('Пользователь уже записан на эту тренировку');
        }
        
        const bookingData = {
            user_id: parseInt(user_id),
            training_id: parseInt(training_id),
            date: date || new Date().toISOString().split('T')[0],
            status: status || 'confirmed',
            booking_date: new Date().toISOString()
        };
        
        const newBooking = await databases.bookings.create(bookingData);
        
        // Обновляем количество записей на тренировку
        const training = await databases.trainings.findById(training_id);
        if (training) {
            await databases.trainings.updateById(training_id, {
                current_bookings: (training.current_bookings || 0) + 1
            });
        }
        
        return newBooking.id;
    } catch (error) {
        console.error('Ошибка создания записи:', error);
        throw error;
    }
}

/**
 * Получить записи пользователя с информацией о тренировках
 */
async function getUserBookings(user_id) {
    try {
        const bookings = await databases.bookings.findWhere({ 
            user_id: parseInt(user_id) 
        });
        
        const trainings = await databases.trainings.findAll();
        const trainers = await databases.trainers.findAll();
        
        // Присоединяем информацию о тренировках и тренерах
        const bookingsWithDetails = bookings.map(booking => {
            const training = trainings.find(t => t.id === booking.training_id);
            const trainer = training ? trainers.find(tr => tr.id === training.trainer_id) : null;
            
            return {
                ...booking,
                title: training ? training.title : 'Неизвестная тренировка',
                start_time: training ? training.start_time : null,
                end_time: training ? training.end_time : null,
                trainer_name: trainer ? trainer.name : 'Неизвестный тренер',
                price: training ? training.price : 0
            };
        });
        
        return bookingsWithDetails;
    } catch (error) {
        console.error('Ошибка получения записей пользователя:', error);
        throw error;
    }
}

/**
 * Отменить запись
 */
async function cancelBooking(bookingId, userId) {
    try {
        const booking = await databases.bookings.findById(bookingId);
        
        if (!booking || booking.user_id !== parseInt(userId)) {
            throw new Error('Запись не найдена или принадлежит другому пользователю');
        }
        
        // Обновляем статус записи
        await databases.bookings.updateById(bookingId, {
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
        });
        
        // Уменьшаем количество записей на тренировку
        const training = await databases.trainings.findById(booking.training_id);
        if (training && training.current_bookings > 0) {
            await databases.trainings.updateById(booking.training_id, {
                current_bookings: training.current_bookings - 1
            });
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка отмены записи:', error);
        throw error;
    }
}

module.exports = {
    // Users
    getUserByEmail,
    createUser,
    getUserById,
    updateUser,

    // Trainers
    getAllTrainers,
    addTrainer,
    getTrainerById,

    // Muscle Groups
    getAllMuscleGroups,
    addMuscleGroup,

    // Exercises
    getAllExercises,
    addExercise,
    getExercisesByMuscleGroup,

    // Trainings
    getAllTrainings,
    createTraining,
    getTrainingById,

    // Bookings
    createBooking,
    getUserBookings,
    cancelBooking
};