// Добавляем функции в глобальный объект FitApp
window.FitApp = window.FitApp || {};
window.FitApp.User = {
    loadUserData,
    loadUserBookings,
    cancelBooking,
    addBookingToProfile
};

document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации при загрузке страницы
    FitApp.checkAuth();
    
    // Обработчик кнопки выхода
    const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        FitApp.logout();
    });
}

    
    // Загрузка данных пользователя и тренировок
    loadUserData();
    loadUserBookings();

        const cancelBtn = document.getElementById('cancel-btn');
if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
        localStorage.removeItem('userBookings');
        loadUserBookings();
    });
}
});

async function loadUserData() {
    try {
        const response = await FitApp.fetchWithAuth(`${FitApp.apiBaseUrl}/auth/me`);
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных пользователя');
        }
        
        const userData = await response.json();
        
        // Обновление UI
        document.getElementById('user-name').textContent = userData.name || 'Не указано';
        document.getElementById('user-email').textContent = userData.email || 'Не указано';
        document.getElementById('user-phone').textContent = userData.phone || 'Не указано';
        
    } catch (error) {
        console.error('Ошибка:', error);
        FitApp.showNotification(error.message, 'error');
        
        // Если ошибка авторизации - перенаправляем на страницу входа
        if (error.message.includes('401') || error.message.includes('403')) {
            setTimeout(() => {
                window.location.href = '/auth';
            }, 1500);
        }
    }
}

async function loadUserBookings() {
    const workoutList = document.getElementById('workout-list');
    if (!workoutList) return;
    
    try {
        workoutList.innerHTML = '<li>Завантаження тренувань...</li>';
        
        let bookings = [];
        const localBookings = localStorage.getItem('userBookings');
        

            if (localBookings) {
                bookings = JSON.parse(localBookings);
            }
        
        // Если все еще нет данных, используем пустой массив
        if (!bookings) bookings = [];
        
        workoutList.innerHTML = '';
        
        if (bookings.length === 0) {
            workoutList.innerHTML = '<li class="no-bookings">У вас поки немає записів на тренування</li>';
            return;
        }
        
        // Рендеринг списка тренировок
        bookings.forEach(booking => {
            const bookingDate = new Date(booking.date);
            const bookingItem = document.createElement('li');
            bookingItem.className = `booking-item ${booking.status}`;
            
            bookingItem.innerHTML = `
                <div class="booking-info">
                    <span class="workout-date">${formatBookingDate(bookingDate)}</span>
                    <span class="workout-time">${formatBookingTime(booking.time)}</span><br>
                    <span class="workout-type">${booking.workoutType}</span><br>
                    <span class="trainer-name">${booking.trainerName}</span>
                    <span class="booking-status">${getStatusText(booking.status)}</span>
                </div>
             ${booking.status === 'confirmed' || booking.status === 'pending' ? 
                    `<button class="cancel-btn" id="cancel-btn" onclick="FitApp.User.cancelBooking('${booking.id}')">Скасувати</button>` : 
                    ''}
            `;
            
            workoutList.appendChild(bookingItem);
        });
        
    } catch (error) {
        console.error('Ошибка загрузки тренировок:', error);
        workoutList.innerHTML = '<li class="error">Помилка завантаження тренувань</li>';
    }
}

// Функция для форматирования даты
function formatBookingDate(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Сьогодні';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Завтра';
    } else {
        return date.toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            weekday: 'short'
        });
    }
}

// Функция для форматирования времени
function formatBookingTime(time) {
    return time.substring(0, 5); // Убираем секунды, оставляем ЧЧ:ММ
}

// Функция для получения текста статуса
function getStatusText(status) {
    const statusMap = {
        'pending': 'Очікує підтвердження',
        'confirmed': 'Підтверджено',
        'completed': 'Завершено',
        'cancelled': 'Скасовано'
    };
    return statusMap[status] || status;
}

// Функция для отмены записи
async function cancelBooking(bookingId) {
    if (!confirm('Ви впевнені, що хочете скасувати це тренування?')) {
        return;
    }
    
    try {
        // Сначала пытаемся отменить через API
        try {
            const response = await FitApp.fetchWithAuth(`${FitApp.apiBaseUrl}/bookings/${bookingId}/cancel`, {
                method: 'POST'
            });
            
            if (response.ok) {
                FitApp.showNotification('Запис успішно скасовано', 'success');
            }
        } catch (apiError) {
            console.log('API недоступно, отменяем локально');
        }
        
        // Обновляем локальные данные (не удаляя весь localStorage!)
        const localBookings = localStorage.getItem('userBookings');
        if (localBookings) {
            const bookings = JSON.parse(localBookings);
            const updatedBookings = bookings.map(booking => 
                booking.id === bookingId 
                    ? { ...booking, status: 'cancelled' }  // Помечаем как "cancelled"
                    : booking
            );
            localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        }
        
        // Перезагружаем список
        loadUserBookings();
        
    } catch (error) {
        console.error('Ошибка отмены записи:', error);
        FitApp.showNotification('Помилка скасування запису', 'error');
    }
}

// Функция для добавления новой записи (вызывается из booking.js)
function addBookingToProfile(bookingData) {
    const existingBookings = localStorage.getItem('userBookings');
    let bookings = existingBookings ? JSON.parse(existingBookings) : [];
    
    // Добавляем новую запись
    bookings.push({
        id: bookingData.id || Date.now().toString(),
        date: bookingData.date,
        time: bookingData.time,
        trainerName: bookingData.trainerName,
        workoutType: bookingData.workoutType || 'Персональна тренування',
        status: 'confirmed'
    });
    
    // Сохраняем в localStorage
    localStorage.setItem('userBookings', JSON.stringify(bookings));
    
    // Если мы на странице профиля, обновляем список
    if (document.getElementById('workout-list')) {
        loadUserBookings();
    }
}