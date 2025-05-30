const bcrypt = require('bcryptjs');
const queries = require('../models/queries');

// Регистрация нового пользователя
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Проверка на существующего пользователя
    const existingUser = await queries.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует.' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await queries.createUser({
      name,
      email,
      password: hashedPassword,
      phone
    });

    res.status(201).json({ message: 'Регистрация прошла успешно', userId });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Аутентификация пользователя
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await queries.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Здесь можно добавить генерацию JWT токена
    res.status(200).json({ message: 'Успешный вход', userId: user.id, name: user.name });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение всех пользователей (например, для админки)
const getAllUsers = async (req, res) => {
  try {
    const users = await queries.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers
};
