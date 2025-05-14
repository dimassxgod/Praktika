const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Тренеры
router.get('/trainers', contentController.getAllTrainers);

// Группы мышц
router.get('/musclegroups', contentController.getAllMuscleGroups);

// Упражнения по группе мышц (по ID)
router.get('/exercises/:muscleGroupId', contentController.getExercisesByMuscleGroup);

// Все тренировки
router.get('/trainings', contentController.getAllTrainings);

module.exports = router;
