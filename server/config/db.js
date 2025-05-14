const mysql = require('mysql2');

// Создание пула соединений
const pool = mysql.createPool({
  host: 'localhost',       // хост базы данных
  user: 'root',            // имя пользователя
  password: '',            // пароль
  database: 'fitness_app', // имя базы данных
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Обертка для поддержки async/await
const promisePool = pool.promise();

module.exports = promisePool;
