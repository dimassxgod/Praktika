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
    
    try {
        // Показываем индикатор загрузки
        workoutList.innerHTML = '<li>Завантаження тренувань...</li>';
        
        let bookings = [];
        
        // Сначала пытаемся загрузить из localStorage (локальные данные)
        const localBookings = localStorage.getItem('userBookings');
        if (localBookings) {
            bookings = JSON.parse(localBookings);
        } else {
            // Если локальных данных нет, пытаемся загрузить с API
            try {
                const response = await FitApp.fetchWithAuth(`${FitApp.apiBaseUrl}/bookings/my`);
                if (response.ok) {
                    bookings = await response.json();
                }
            } catch (apiError) {
                console.log('API недоступно, используем локальные данные');
                // Если API недоступно, можно использовать демо-данные или пустой массив
                bookings = [];
            }
        }
        
        // Очищаем список
        workoutList.innerHTML = '';
        
        if (!bookings || bookings.length === 0) {
            workoutList.innerHTML = '<li class="no-bookings">У вас поки немає записів на тренування</li>';
            return;
        }
        
        // Фильтруем и сортируем предстоящие тренировки
        const upcomingBookings = bookings
            .filter(booking => {
                const bookingDate = new Date(booking.date + 'T' + booking.time);
                return bookingDate > new Date() && booking.status !== 'cancelled';
            })
            .sort((a, b) => {
                const dateA = new Date(a.date + 'T' + a.time);
                const dateB = new Date(b.date + 'T' + b.time);
                return dateA - dateB;
            })
            .slice(0, 5); // Показываем только ближайшие 5 тренировок
        
        if (upcomingBookings.length === 0) {
            workoutList.innerHTML = '<li class="no-bookings">Немає найближчих тренувань</li>';
            return;
        }
        
        // Отображаем тренировки
        upcomingBookings.forEach(booking => {
            const listItem = document.createElement('li');
            listItem.className = 'booking-item';
            
            const bookingDate = new Date(booking.date + 'T' + booking.time);
            const formattedDate = formatBookingDate(bookingDate);
            const formattedTime = formatBookingTime(booking.time);
            
            listItem.innerHTML = `
                <div class="booking-info">
                    <div class="booking-main">
                        <strong>${booking.trainerName || 'Тренер не указан'}</strong>
                        <span class="booking-date">${formattedDate} о ${formattedTime}</span>
                    </div>
                    <div class="booking-details">
                        <span class="booking-type">${booking.workoutType || 'Персональна тренування'}</span>
                        <span class="booking-status status-${booking.status}">${getStatusText(booking.status)}</span>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="btn-small btn-cancel" onclick="cancelBooking('${booking.id}')">
                        Скасувати
                    </button>
                </div>
            `;
            
            workoutList.appendChild(listItem);
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
        
        // В любом случае обновляем локальные данные
        const localBookings = localStorage.getItem('userBookings');
        if (localBookings) {
            const bookings = JSON.parse(localBookings);
            const updatedBookings = bookings.map(booking => 
                booking.id === bookingId 
                    ? { ...booking, status: 'cancelled' }
                    : booking
            );
            localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        }
        
        // Перезагружаем список тренировок
        setTimeout(() => {
            loadUserBookings();
        }, 1000);
        
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