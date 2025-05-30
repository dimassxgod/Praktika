const db = require('./database');

// === USERS ===

async function getUserByEmail(email) {
  const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
  return rows[0];
}

async function createUser({ name, email, password, phone }) {
  const [result] = await db.query(
    'INSERT INTO Users (name, email, password, phone) VALUES (?, ?, ?, ?)',
    [name, email, password, phone]
  );
  return result.insertId;
}

// === TRAINERS ===

async function getAllTrainers() {
  const [rows] = await db.query('SELECT * FROM Trainers');
  return rows;
}

async function addTrainer({ name, specialization, description }) {
  const [result] = await db.query(
    'INSERT INTO Trainers (name, specialization, description) VALUES (?, ?, ?)',
    [name, specialization, description]
  );
  return result.insertId;
}

// === MUSCLE GROUPS ===

async function getAllMuscleGroups() {
  const [rows] = await db.query('SELECT * FROM MuscleGroups');
  return rows;
}

async function addMuscleGroup({ name, description }) {
  const [result] = await db.query(
    'INSERT INTO MuscleGroups (name, description) VALUES (?, ?)',
    [name, description]
  );
  return result.insertId;
}

// === EXERCISES ===

async function getAllExercises() {
  const [rows] = await db.query(`
    SELECT Exercises.*, MuscleGroups.name AS muscle_group 
    FROM Exercises
    LEFT JOIN MuscleGroups ON Exercises.muscle_group_id = MuscleGroups.id
  `);
  return rows;
}

async function addExercise({ name, description, muscle_group_id, gif_url }) {
  const [result] = await db.query(
    'INSERT INTO Exercises (name, description, muscle_group_id, gif_url) VALUES (?, ?, ?, ?)',
    [name, description, muscle_group_id, gif_url]
  );
  return result.insertId;
}

async function getExercisesByMuscleGroup(muscleGroupId) {
  const [rows] = await db.query(`
    SELECT Exercises.*, MuscleGroups.name AS muscle_group 
    FROM Exercises
    LEFT JOIN MuscleGroups ON Exercises.muscle_group_id = MuscleGroups.id
    WHERE Exercises.muscle_group_id = ?
  `, [muscleGroupId]);
  return rows;
}

// === TRAININGS ===

async function getAllTrainings() {
  const [rows] = await db.query(`
    SELECT Trainings.*, Trainers.name AS trainer_name 
    FROM Trainings
    LEFT JOIN Trainers ON Trainings.trainer_id = Trainers.id
  `);
  return rows;
}

async function createTraining({ trainer_id, title, start_time, end_time, capacity }) {
  const [result] = await db.query(
    'INSERT INTO Trainings (trainer_id, title, start_time, end_time, capacity) VALUES (?, ?, ?, ?, ?)',
    [trainer_id, title, start_time, end_time, capacity]
  );
  return result.insertId;
}

// === BOOKINGS ===

async function createBooking({ user_id, training_id, date }) {
  const [result] = await db.query(
    'INSERT INTO Bookings (user_id, training_id, date) VALUES (?, ?, ?)',
    [user_id, training_id, date]
  );
  return result.insertId;
}

async function getUserBookings(user_id) {
  const [rows] = await db.query(`
    SELECT Bookings.*, Trainings.title, Trainings.start_time, Trainings.end_time 
    FROM Bookings
    JOIN Trainings ON Bookings.training_id = Trainings.id
    WHERE Bookings.user_id = ?
  `, [user_id]);
  return rows;
}

module.exports = {
  // Users
  getUserByEmail,
  createUser,

  // Trainers
  getAllTrainers,
  addTrainer,

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

  // Bookings
  createBooking,
  getUserBookings
};