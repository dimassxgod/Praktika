const queries = require('../models/queries');

// ===== УПРАЖНЕНИЯ =====

// Получить все упражнения
const getAllExercises = async (req, res) => {
  try {
    const exercises = await queries.getAllExercises();
    res.status(200).json(exercises);
  } catch (error) {
    console.error('Ошибка при получении упражнений:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Добавить новое упражнение
const addExercise = async (req, res) => {
  try {
    const { name, description, muscle_group_id, gif_url } = req.body;
    const id = await queries.addExercise({ name, description, muscle_group_id, gif_url });
    res.status(201).json({ message: 'Упражнение добавлено', id });
  } catch (error) {
    console.error('Ошибка при добавлении упражнения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const getAllTrainings = async (req, res) => {
  try {
    const trainings = await queries.getAllTrainings();
    res.status(200).json(trainings);
  } catch (error) {
    console.error('Ошибка при получении тренировок:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
// ===== ГРУППЫ МЫШЦ =====

const getAllMuscleGroups = async (req, res) => {
  try {
    const groups = await queries.getAllMuscleGroups();
    res.status(200).json(groups);
  } catch (error) {
    console.error('Ошибка при получении групп мышц:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const addMuscleGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const id = await queries.addMuscleGroup({ name, description });
    res.status(201).json({ message: 'Группа мышц добавлена', id });
  } catch (error) {
    console.error('Ошибка при добавлении группы мышц:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ===== ТРЕНЕРЫ =====

const getAllTrainers = async (req, res) => {
  try {
    const trainers = await queries.getAllTrainers();
    res.status(200).json(trainers);
  } catch (error) {
    console.error('Ошибка при получении тренеров:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const addTrainer = async (req, res) => {
  try {
    const { name, specialization, description } = req.body;
    const id = await queries.addTrainer({ name, specialization, description });
    res.status(201).json({ message: 'Тренер добавлен', id });
  } catch (error) {
    console.error('Ошибка при добавлении тренера:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  // Упражнения
  getAllExercises,
  addExercise,

  // Группы мышц
  getAllMuscleGroups,
  addMuscleGroup,

  // Тренеры
  getAllTrainers,
  addTrainer
};
