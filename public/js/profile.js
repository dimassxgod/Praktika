document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Загрузка данных пользователя
    const userResponse = await fetch('/api/user');
    const user = await userResponse.json();

    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-age').textContent = user.age;

    // Загрузка данных о тренировках
    const workoutResponse = await fetch('/api/workouts');
    const workouts = await workoutResponse.json();

    const workoutList = document.getElementById('workout-list');
    workoutList.innerHTML = '';

    if (workouts.length === 0) {
      workoutList.innerHTML = '<li>Нет предстоящих тренировок</li>';
    } else {
      workouts.forEach(w => {
        const li = document.createElement('li');
        li.textContent = `${w.date} — ${w.type}`;
        workoutList.appendChild(li);
      });
    }
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    alert('Не удалось загрузить данные профиля. Повторите попытку позже.');
  }
});
