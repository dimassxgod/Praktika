/**
 * FitApp - booking.js
 * Клиентский скрипт для записи на тренировки
 */

// Глобальные переменные для booking
let selectedTrainer = null;
let selectedDate = null;
let selectedTime = null;
let availableTrainings = [];
let trainers = [];

// Инициализация модуля записи
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.booking')) {
        initBooking();
    }
});

/**
 * Инициализация системы записи
 */
async function initBooking() {
    try {
        await loadTrainers();
        await loadTrainings();
        renderTrainers();
        initCalendar();
        setupBookingHandlers();
    } catch (error) {
        console.error('Ошибка инициализации записи:', error);
        showNotification('Ошибка загрузки данных для записи', 'error');
    }
}

/**
 * Загрузка списка тренеров
 */
async function loadTrainers() {
    try {
        const response = await fetch(`${window.FitApp.apiBaseUrl}/content/trainers`);
        if (response.ok) {
            trainers = await response.json();
        } else {
            throw new Error('Ошибка загрузки тренеров');
        }
    } catch (error) {
        console.error('Ошибка загрузки тренеров:', error);
        trainers = [];
    }
}

/**
 * Загрузка доступных тренировок
 */
async function loadTrainings() {
    try {
        const response = await fetch(`${window.FitApp.apiBaseUrl}/content/trainings`);
        if (response.ok) {
            availableTrainings = await response.json();
        } else {
            throw new Error('Ошибка загрузки тренировок');
        }
    } catch (error) {
        console.error('Ошибка загрузки тренировок:', error);
        availableTrainings = [];
    }
}

/**
 * Отображение списка тренеров
 */
function renderTrainers() {
    const trainersList = document.querySelector('.trainers-list');
    
    if (!trainersList || trainers.length === 0) {
        if (trainersList) {
            trainersList.innerHTML = '<p>Тренеры не найдены</p>';
        }
        return;
    }
    
    trainersList.innerHTML = trainers.map(trainer => `
        <div class="trainer-card ${selectedTrainer?.id === trainer.id ? 'selected' : ''}" 
             data-trainer-id="${trainer.id}">
            <div class="trainer-avatar">
                <img src="${trainer.photo || 'assets/images/trainers/default.jpg'}" 
                     alt="${trainer.name}"
                     onerror="this.src='assets/images/trainers/default.jpg'">
            </div>
            <div class="trainer-info">
                <h4>${trainer.name}</h4>
                <p class="trainer-specialty">${trainer.specialty || 'Фітнес-тренер'}</p>
                <p class="trainer-experience">${trainer.experience || 'Досвід: 1+ років'}</p>
                <div class="trainer-rating">
                    ${renderStars(trainer.rating || 5)}
                    <span class="rating-text">${trainer.rating || 5}/5</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Добавляем обработчики событий для карточек тренеров
    const trainerCards = trainersList.querySelectorAll('.trainer-card');
    trainerCards.forEach(card => {
        card.addEventListener('click', () => {
            const trainerId = parseInt(card.dataset.trainerId);
            selectTrainer(trainerId);
        });
    });
}

/**
 * Отображение звезд рейтинга
 */
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHtml = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

/**
 * Выбор тренера
 */
function selectTrainer(trainerId) {
    selectedTrainer = trainers.find(t => t.id === trainerId);
    
    // Обновляем UI
    document.querySelectorAll('.trainer-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-trainer-id="${trainerId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Обновляем календарь
    updateCalendar();
    
    // Сбрасываем выбранное время
    selectedTime = null;
    updateBookingButton();
    
    console.log('Выбран тренер:', selectedTrainer);
}

/**
 * Инициализация календаря
 */
function initCalendar() {
    const calendar = document.querySelector('.calendar');
    if (!calendar) return;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    renderCalendar(currentYear, currentMonth);
}

/**
 * Отображение календаря
 */
function renderCalendar(year, month) {
    const calendar = document.querySelector('.calendar');
    if (!calendar) return;
    
    const today = new Date();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const monthNames = [
        'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
        'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ];
    
    const dayNames = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    
    let calendarHtml = `
        <div class="calendar-header">
            <button class="calendar-nav prev-month" data-year="${year}" data-month="${month - 1}">
                <i class="fas fa-chevron-left"></i>
            </button>
            <h3 class="calendar-title">${monthNames[month]} ${year}</h3>
            <button class="calendar-nav next-month" data-year="${year}" data-month="${month + 1}">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        <div class="calendar-grid">
            <div class="calendar-days-header">
                ${dayNames.map(day => `<div class="day-header">${day}</div>`).join('')}
            </div>
            <div class="calendar-days">
    `;
    
    // Пустые ячейки в начале месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarHtml += '<div class="calendar-day empty"></div>';
    }
    
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = formatDateForBooking(date);
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today && !isToday;
        const isSelected = selectedDate === dateString;
        const hasTrainings = selectedTrainer && hasAvailableTrainings(dateString);
        
        let classes = ['calendar-day'];
        if (isToday) classes.push('today');
        if (isPast) classes.push('past');
        if (isSelected) classes.push('selected');
        if (hasTrainings) classes.push('has-trainings');
        if (!hasTrainings && selectedTrainer) classes.push('no-trainings');
        
        calendarHtml += `
            <div class="${classes.join(' ')}" 
                 data-date="${dateString}"
                 ${!isPast && hasTrainings ? 'data-clickable="true"' : ''}>
                <span class="day-number">${day}</span>
                ${hasTrainings ? '<div class="training-indicator"></div>' : ''}
            </div>
        `;
    }
    
    calendarHtml += `
            </div>
        </div>
        <div class="time-slots">
            <h4>Доступное время:</h4>
            <div class="time-slots-grid">
                <p>Выберите дату для просмотра доступного времени</p>
            </div>
        </div>
    `;
    
    calendar.innerHTML = calendarHtml;
    
    // Добавляем обработчики событий
    setupCalendarHandlers();
}

/**
 * Настройка обработчиков событий для календаря
 */
function setupCalendarHandlers() {
    // Навигация по месяцам
    document.querySelectorAll('.calendar-nav').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const year = parseInt(e.currentTarget.dataset.year);
            const month = parseInt(e.currentTarget.dataset.month);
            
            let newYear = year;
            let newMonth = month;
            
            if (newMonth < 0) {
                newMonth = 11;
                newYear--;
            } else if (newMonth > 11) {
                newMonth = 0;
                newYear++;
            }
            
            renderCalendar(newYear, newMonth);
        });
    });
    
    // Выбор даты
    document.querySelectorAll('.calendar-day[data-clickable="true"]').forEach(day => {
        day.addEventListener('click', (e) => {
            const date = e.currentTarget.dataset.date;
            selectDate(date);
        });
    });
}

/**
 * Выбор даты
 */
function selectDate(dateString) {
    selectedDate = dateString;
    selectedTime = null;
    
    // Обновляем UI календаря
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });
    
    const selectedDay = document.querySelector(`[data-date="${dateString}"]`);
    if (selectedDay) {
        selectedDay.classList.add('selected');
    }
    
    // Отображаем доступные временные слоты
    renderTimeSlots(dateString);
    updateBookingButton();
    
    console.log('Выбрана дата:', dateString);
}

/**
 * Отображение временных слотов
 */
function renderTimeSlots(dateString) {
    const timeSlotsGrid = document.querySelector('.time-slots-grid');
    if (!timeSlotsGrid || !selectedTrainer) return;
    
    const availableSlots = getAvailableTimeSlots(selectedTrainer.id, dateString);
    
    if (availableSlots.length === 0) {
        timeSlotsGrid.innerHTML = '<p>На выбранную дату нет свободного времени</p>';
        return;
    }
    
    timeSlotsGrid.innerHTML = availableSlots.map(slot => `
        <button class="time-slot ${selectedTime === slot ? 'selected' : ''}" 
                data-time="${slot}">
            ${slot}
        </button>
    `).join('');
    
    // Добавляем обработчики для временных слотов
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', (e) => {
            const time = e.currentTarget.dataset.time;
            selectTime(time);
        });
    });
}

/**
 * Выбор времени
 */
function selectTime(time) {
    selectedTime = time;
    
    // Обновляем UI
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    const selectedSlot = document.querySelector(`[data-time="${time}"]`);
    if (selectedSlot) {
        selectedSlot.classList.add('selected');
    }
    
    updateBookingButton();
    
    console.log('Выбрано время:', time);
}

/**
 * Обновление календаря при выборе тренера
 */
function updateCalendar() {
    const currentCalendarTitle = document.querySelector('.calendar-title');
    if (currentCalendarTitle) {
        const titleText = currentCalendarTitle.textContent;
        const [monthName, year] = titleText.split(' ');
        const monthNames = [
            'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
            'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
        ];
        const monthIndex = monthNames.indexOf(monthName);
        renderCalendar(parseInt(year), monthIndex);
    }
}

/**
 * Проверка наличия доступных тренировок на дату
 */
function hasAvailableTrainings(dateString) {
    if (!selectedTrainer) return false;
    
    return availableTrainings.some(training => 
        training.trainerId === selectedTrainer.id && 
        training.date === dateString &&
        !training.isBooked
    );
}

/**
 * Получение доступных временных слотов
 */
function getAvailableTimeSlots(trainerId, dateString) {
    return availableTrainings
        .filter(training => 
            training.trainerId === trainerId && 
            training.date === dateString &&
            !training.isBooked
        )
        .map(training => training.time)
        .sort();
}

/**
 * Настройка обработчиков записи
 */
function setupBookingHandlers() {
    const bookBtn = document.querySelector('.book-btn');
    if (bookBtn) {
        bookBtn.addEventListener('click', handleBooking);
    }
}

/**
 * Обработка записи на тренировку (исправленная версия)
 */
async function handleBooking() {
    // Проверка авторизации с подробной отладкой
    if (!window.FitApp.currentUser) {
        console.log('❌ Пользователь не авторизован');
        showNotification('Необходимо войти в систему для записи', 'warning');
        return;
    }
    
    console.log('👤 Текущий пользователь:', window.FitApp.currentUser);
    
    if (!selectedTrainer || !selectedDate || !selectedTime) {
        showNotification('Выберите тренера, дату и время', 'warning');
        return;
    }
    
    try {
        const bookingData = {
            trainerId: selectedTrainer.id,
            date: selectedDate,
            time: selectedTime,
            trainerName: selectedTrainer.name,
            userId: window.FitApp.currentUser.id,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            notes: ''
        };
        
        console.log('📝 Данные для записи:', bookingData);
        
        // Подготавливаем заголовки с токеном
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Добавляем токен если он есть
        if (window.FitApp.currentUser.token) {
            headers['Authorization'] = `Bearer ${window.FitApp.currentUser.token}`;
            console.log('🔑 Токен добавлен в заголовки');
        } else {
            console.log('⚠️ Токен отсутствует');
        }
        
        console.log('📤 Отправка запроса на:', `${window.FitApp.apiBaseUrl}/bookings`);
        console.log('📋 Заголовки:', headers);
        
        // Отправляем запрос на сервер
        const response = await fetch(`${window.FitApp.apiBaseUrl}/bookings`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(bookingData)
        });
        
        console.log('📨 Ответ сервера:', response.status, response.statusText);
        
        if (!response.ok) {
            let errorMessage = `Ошибка сервера: ${response.status}`;
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
                console.log('❌ Детали ошибки:', errorData);
            } catch (e) {
                console.log('❌ Не удалось получить детали ошибки');
            }
            
            throw new Error(errorMessage);
        }
        
        const createdBooking = await response.json();
        console.log('✅ Запись создана:', createdBooking);
        
        // Обновляем локальные данные
        const trainingToBook = availableTrainings.find(training => 
            training.trainerId === selectedTrainer.id && 
            training.date === selectedDate &&
            training.time === selectedTime &&
            !training.isBooked
        );
        
        if (trainingToBook) {
            trainingToBook.isBooked = true;
        }
        
        showNotification(`Запись успешно создана! Тренер: ${selectedTrainer.name}, Дата: ${selectedDate}, Время: ${selectedTime}`, 'success');
        
        // Обновляем UI
        updateCalendar();
        renderTimeSlots(selectedDate);
        selectedTime = null;
        updateBookingButton();
        
        // Обновляем данные пользователя
        if (window.FitApp.User && window.FitApp.User.loadUserBookings) {
            await window.FitApp.User.loadUserBookings();
        }
        
    } catch (error) {
        console.error('❌ Ошибка записи:', error);
        showNotification(`Ошибка записи: ${error.message}`, 'error');
    }
}

/**
 * Получить существующие записи пользователя
 */
function getExistingBookings() {
    try {
        const stored = localStorage.getItem('userBookings');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Ошибка получения записей:', error);
        return [];
    }
}

/**
 * Обновление состояния кнопки записи
 */
function updateBookingButton() {
    const bookBtn = document.querySelector('.book-btn');
    if (!bookBtn) return;
    
    const canBook = window.FitApp.currentUser && selectedTrainer && selectedDate && selectedTime;
    
    bookBtn.disabled = !canBook;
    bookBtn.textContent = canBook ? 'Записаться' : 'Выберите тренера, дату и время';
}

/**
 * Форматирование даты для записи
 */
function formatDateForBooking(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function saveBookingToProfile(formData, trainerData) {
    const bookingData = {
        id: Date.now().toString(), // Генерируем уникальный ID
        date: formData.get('date'),
        time: formData.get('time'),
        trainerName: trainerData.name,
        workoutType: formData.get('workout-type') || 'Персональна тренування',
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    // Получаем существующие записи
    const existingBookings = localStorage.getItem('userBookings');
    let bookings = existingBookings ? JSON.parse(existingBookings) : [];
    
    // Добавляем новую запись
    bookings.push(bookingData);
    
    // Сохраняем обратно в localStorage
    localStorage.setItem('userBookings', JSON.stringify(bookings));
    
    console.log('Запись сохранена в профиль:', bookingData);
}

function onBookingSuccess(bookingResponse, formData, trainerInfo) {
    // Сохраняем в профиль
    saveBookingToProfile(formData, trainerInfo);
    
    // Показываем уведомление
    if (typeof FitApp !== 'undefined' && FitApp.showNotification) {
        FitApp.showNotification('Ви успішно записалися на тренування!', 'success');
    } else {
        alert('Ви успішно записалися на тренування!');
    }
}

// Функция для очистки старых записей (опционально)
function cleanOldBookings() {
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const now = new Date();
    
    // Удаляем записи старше 30 дней
    const filteredBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        const diffTime = now - bookingDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
    });
    
    localStorage.setItem('userBookings', JSON.stringify(filteredBookings));
}

/**
 * Экспорт функций в глобальный объект
 */
window.FitApp = window.FitApp || {};
window.FitApp.Booking = {
    initBooking,
    loadTrainers,
    loadTrainings,
    selectTrainer,
    selectDate,
    selectTime,
    handleBooking
};