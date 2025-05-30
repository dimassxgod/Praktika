document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Загрузка данных пользователя
    const userResponse = await fetch('/api/user');
    const user = await userResponse.json();

    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-age').textContent = user.age;

        const db = (await require('./config/db').db);
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        
        // Загрузка тренировок
        const workouts = await db.collection('bookings')
            .find({ userId: user._id })
            .sort({ date: 1 })
            .toArray();
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    alert('Не удалось загрузить данные профиля. Повторите попытку позже.');
  }
});
