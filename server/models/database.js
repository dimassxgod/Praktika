const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fitapp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Ошибка подключения к базе данных:', err.message);
    } else {
        console.log('✅ Подключение к базе данных установлено');
        connection.release();
    }
});

module.exports = pool;
