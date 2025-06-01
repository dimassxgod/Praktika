/**
 * FitApp - booking.js
 * JavaScript файл для функциональности записи на тренировки
 */

// Глобальные переменные
let trainers = []; // Список тренеров
let selectedTrainer = null; // Выбранный тренер
let selectedDate = null; // Выбранная дата
let selectedTime = null; // Выбранное время
let availableTimeSlots = []; // Доступные временные интервалы

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initBookingForm();
});

/**
 * Инициализация формы записи на тренировку
 */
function initBookingForm() {
    const trainersListContainer = document.querySelector('.trainers-list');
    const calendarContainer = document.querySelector('.calendar');
    const bookBtn = document.querySelector('.book-btn');
    
    if (!trainersListContainer || !calendarContainer) return;
    
    // Загрузка тренеров
    loadTrainers()
        .then(() => {
            renderTrainersList(trainersListContainer);
        })
        .catch(error => {
            console.error('Ошибка загрузки тренеров:', error);
            trainersListContainer.innerHTML = '<p class="error-message">Ошибка загрузки списка тренеров</p>';
        });
    
    // Инициализация календаря
    initCalendar(calendarContainer);
    
    // Обработчик кнопки записи
    if (bookBtn) {
        bookBtn.addEventListener('click', handleBooking);
    }
}

/**
 * Загрузка списка тренеров с сервера
 * @returns {Promise} - Promise с данными тренеров
 */
function loadTrainers() {
    // Используем функцию loadData из main.js
    return window.FitApp.loadData('trainers')
        .then(data => {
            trainers = data;
            return trainers;
        })
        .catch(error => {
            // В случае ошибки загружаем тестовые данные
            console.warn('Используем тестовые данные тренеров:', error);
            
            trainers = [
                {
                    id: 1,
                    name: 'Олександр Петров',
                    specialty: 'Силові тренування',
                    experience: 5,
                    photo: '../assets/images/trainers/trainer1.jpg'
                },
                {
                    id: 2,
                    name: 'Олена Сидорова',
                    specialty: 'Йога, Стретчінг',
                    experience: 7,
                    photo: '../assets/images/trainers/trainer2.jpg'
                },
                {
                    id: 3,
                    name: 'Максим Ковальов',
                    specialty: 'Функціональний тренінг, HIIT',
                    experience: 4,
                    photo: '../assets/images/trainers/trainer3.jpg'
                },
            ];
            
            return trainers;
        });
}

/**
 * Отрисовка списка тренеров
 * @param {HTMLElement} container - DOM-элемент для списка тренеров
 */
function renderTrainersList(container) {
    if (trainers.length === 0) {
        container.innerHTML = '<p>Нет доступных тренеров</p>';
        return;
    }
    
    let html = `<div class="trainers-selection">`;
    
    trainers.forEach(trainer => {
        html += `
            <div class="trainer-item" data-trainer-id="${trainer.id}">
                <div class="trainer-photo">
                    <img src="${trainer.photo || '../assets/images/trainer-placeholder.jpg'}" alt="${trainer.name}">
                </div>
                <div class="trainer-details">
                    <h4>${trainer.name}</h4>
                    <p class="trainer-specialty">${trainer.specialty}</p>
                    <p class="trainer-experience">Досвід: ${trainer.experience} ${getYearsWord(trainer.experience)}</p>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
    
    // Добавляем стили
    addTrainerSelectionStyles();
    
    // Добавляем обработчики
    const trainerItems = container.querySelectorAll('.trainer-item');
    trainerItems.forEach(item => {
        item.addEventListener('click', () => {
            // Снимаем выделение со всех тренеров
            trainerItems.forEach(i => i.classList.remove('selected'));
            
            // Выделяем выбранного тренера
            item.classList.add('selected');
            
            // Запоминаем выбранного тренера
            const trainerId = parseInt(item.getAttribute('data-trainer-id'));
            selectedTrainer = trainers.find(t => t.id === trainerId);
            
            // Обновляем доступные временные слоты
            updateTimeSlots();
            
            // Проверяем возможность записи
            checkBookingAvailability();
        });
    });
}

/**
 * Добавление стилей для списка тренеров
 */
function addTrainerSelectionStyles() {
    // Добавляем стили если их еще нет
    if (!document.getElementById('trainer-selection-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'trainer-selection-styles';
        
        styleElement.textContent = `
            .trainers-selection {
                max-height: 300px;
                overflow-y: auto;
            }
            .trainer-item {
                display: flex;
                align-items: center;
                padding: 10px;
                margin-bottom: 10px;
                border-radius: var(--radius);
                background-color: #f9f9f9;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .trainer-item:hover {
                background-color: #f0f0f0;
            }
            .trainer-item.selected {
                background-color: #e8f5e9;
                border-left: 3px solid var(--primary-color);
            }
            .trainer-photo {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                overflow: hidden;
                margin-right: 15px;
            }
            .trainer-photo img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .trainer-details h4 {
                margin: 0 0 5px;
                font-size: 16px;
            }
            .trainer-specialty {
                color: var(--primary-color);
                font-size: 14px;
                margin: 0 0 3px;
            }
            .trainer-experience {
                color: var(--gray-color);
                font-size: 12px;
                margin: 0;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
}

/**
 * Инициализация календаря
 * @param {HTMLElement} container - DOM-элемент для календаря
 */
function initCalendar(container) {
    // Получаем текущую дату
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Создаем календарь на текущий месяц
    renderCalendar(container, currentYear, currentMonth);
    
    // Добавляем стили для календаря
    addCalendarStyles();
}

/**
 * Отрисовка календаря
 * @param {HTMLElement} container - DOM-элемент для календаря
 * @param {number} year - Год
 * @param {number} month - Месяц (0-11)
 */
function renderCalendar(container, year, month) {
    // Получаем первый день месяца
    const firstDay = new Date(year, month, 1);
    // Получаем последний день месяца
    const lastDay = new Date(year, month + 1, 0);
    
    // Название месяцев
    const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ];
    
    // Текущая дата для выделения текущего дня
    const today = new Date();
    
    let html = `
        <div class="calendar-header">
            <button class="calendar-btn prev-month">&laquo;</button>
            <h3 class="calendar-title">${monthNames[month]} ${year}</h3>
            <button class="calendar-btn next-month">&raquo;</button>
        </div>
        <div class="calendar-body">
            <div class="calendar-days-header">
                <div>Пн</div>
                <div>Вт</div>
                <div>Ср</div>
                <div>Чт</div>
                <div>Пт</div>
                <div>Сб</div>
                <div>Нд</div>
            </div>
            <div class="calendar-days">
    `;
    
    // Получаем день недели первого дня месяца (0 - воскресенье, 1 - понедельник и т.д.)
    let firstDayOfWeek = firstDay.getDay();
    // Преобразуем день недели для соответствия нашему формату (понедельник - первый день)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Добавляем пустые ячейки для дней до начала месяца
    for (let i = 0; i < firstDayOfWeek; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }
    
    // Добавляем дни месяца
    const daysInMonth = lastDay.getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        
        // Проверяем, является ли день прошедшим
        const isPastDay = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        // Проверяем, является ли день текущим
        const isToday = date.getDate() === today.getDate() &&
                       date.getMonth() === today.getMonth() &&
                       date.getFullYear() === today.getFullYear();
        
        // Создаем классы для дня
        let dayClass = 'calendar-day';
        if (isPastDay) {
            dayClass += ' past';
        }
        if (isToday) {
            dayClass += ' today';
        }
        
        // Проверяем, выбран ли этот день
        if (selectedDate && date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()) {
            dayClass += ' selected';
        }
        
        // Добавляем день в календарь
        html += `<div class="${dayClass}" data-date="${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}">${day}</div>`;
    }
    
    html += `
            </div>
        </div>
        <div class="time-slots-container">
            <h4>Оберіть час</h4>
            <div class="time-slots">
                <p>Спочатку оберіть дату та тренера</p>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Добавляем обработчики для кнопок навигации по месяцам
    const prevMonthBtn = container.querySelector('.prev-month');
    const nextMonthBtn = container.querySelector('.next-month');
    
    prevMonthBtn.addEventListener('click', () => {
        let newMonth = month - 1;
        let newYear = year;
        
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        
        renderCalendar(container, newYear, newMonth);
    });
    
    nextMonthBtn.addEventListener('click', () => {
        let newMonth = month + 1;
        let newYear = year;
        
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        
        renderCalendar(container, newYear, newMonth);
    });
    
    // Добавляем обработчики для выбора дня
    const dayElements = container.querySelectorAll('.calendar-day:not(.empty):not(.past)');
    dayElements.forEach(dayElement => {
        dayElement.addEventListener('click', () => {
            // Снимаем выделение со всех дней
            dayElements.forEach(el => el.classList.remove('selected'));
            
            // Выделяем выбранный день
            dayElement.classList.add('selected');
            
            // Запоминаем выбранную дату
            const dateStr = dayElement.getAttribute('data-date');
            selectedDate = new Date(dateStr);
            
            // Обновляем доступные временные слоты
            updateTimeSlots();
            
            // Проверяем возможность записи
            checkBookingAvailability();
        });
    });
}

/**
 * Добавление стилей для календаря
 */
function addCalendarStyles() {
    // Добавляем стили если их еще нет
    if (!document.getElementById('calendar-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'calendar-styles';
        
        styleElement.textContent = `
            .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .calendar-title {
                text-align: center;
                margin: 0;
                font-size: 18px;
            }
            
            .calendar-btn {
                background: transparent;
                border: none;
                cursor: pointer;
                font-size: 18px;
                color: var(--primary-color);
                padding: 5px 10px;
            }
            
            .calendar-days-header {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                text-align: center;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .calendar-days {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 5px;
            }
            
            .calendar-day {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 35px;
                border-radius: var(--radius);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .calendar-day:not(.empty):not(.past):hover {
                background-color: #e8f5e9;
            }
            
            .calendar-day.empty {
                visibility: hidden;
            }
            
            .calendar-day.past {
                color: #ccc;
                cursor: not-allowed;
            }
            
            .calendar-day.today {
                border: 1px solid var(--primary-color);
            }
            
            .calendar-day.selected {
                background-color: var(--primary-color);
                color: white;
            }
            
            .time-slots-container {
                margin-top: 20px;
            }
            
            .time-slots-container h4 {
                margin-bottom: 10px;
                font-size: 16px;
                color: var(--dark-color);
            }
            
            .time-slots {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .time-slot {
                padding: 8px 12px;
                border-radius: var(--radius);
                background-color: #f0f0f0;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .time-slot:hover {
                background-color: #e0e0e0;
            }
            
            .time-slot.selected {
                background-color: var(--primary-color);
                color: white;
            }
            
            .time-slot.unavailable {
                background-color: #f5f5f5;
                color: #aaa;
                cursor: not-allowed;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
}

/**
 * Обновление доступных временных слотов
 */
function updateTimeSlots() {
    if (!selectedTrainer || !selectedDate) {
        return;
    }
    
    const timeSlotsContainer = document.querySelector('.time-slots');
    if (!timeSlotsContainer) return;
    
    // Загрузка доступных временных слотов для выбранного тренера и даты
    loadAvailableTimeSlots(selectedTrainer.id, selectedDate)
        .then(slots => {
            renderTimeSlots(timeSlotsContainer, slots);
        })
        .catch(error => {
            console.error('Ошибка загрузки доступных временных слотов:', error);
            timeSlotsContainer.innerHTML = '<p class="error-message">Ошибка загрузки расписания</p>';
        });
}

/**
 * Загрузка доступных временных слотов
 * @param {number} trainerId - ID тренера
 * @param {Date} date - Выбранная дата
 * @returns {Promise} - Promise с данными временных слотов
 */
function loadAvailableTimeSlots(trainerId, date) {
    // В реальном приложении здесь будет запрос к API
    // Сейчас используем тестовые данные
    
    // Форматируем дату для запроса
    const formattedDate = window.FitApp.formatDate(date, 'yyyy-mm-dd');
    
    // Имитация задержки запроса
    return new Promise(resolve => {
        setTimeout(() => {
            // Генерируем тестовые временные слоты
            const workHoursStart = 9; // Начало рабочего дня
            const workHoursEnd = 20; // Конец рабочего дня
            const slotDuration = 60; // Длительность тренировки в минутах
            
            const slots = [];
            
            // Генерируем слоты с 9 до 20 часов с интервалом в 1 час
            for (let hour = workHoursStart; hour < workHoursEnd; hour++) {
                const slotTime = `${String(hour).padStart(2, '0')}:00`;
                
                // Случайным образом определяем доступность слота
                const isAvailable = Math.random() > 0.3; // 70% вероятность, что слот доступен
                
                slots.push({
                    time: slotTime,
                    available: isAvailable
                });
            }
            
            availableTimeSlots = slots;
            resolve(slots);
        }, 300);
    });
}

/**
 * Отрисовка временных слотов
 * @param {HTMLElement} container - DOM-элемент для слотов
 * @param {Array} slots - Массив временных слотов
 */
function renderTimeSlots(container, slots) {
    if (slots.length === 0) {
        container.innerHTML = '<p>Нет доступных временных слотов для выбранной даты</p>';
        return;
    }
    
    let html = '';
    
    slots.forEach(slot => {
        const slotClass = slot.available ? 'time-slot' : 'time-slot unavailable';
        html += `<div class="${slotClass}" data-time="${slot.time}">${slot.time}</div>`;
    });
    
    container.innerHTML = html;
    
    // Добавляем обработчики для выбора времени
    const timeSlotElements = container.querySelectorAll('.time-slot:not(.unavailable)');
    timeSlotElements.forEach(slotElement => {
        slotElement.addEventListener('click', () => {
            // Снимаем выделение со всех слотов
            timeSlotElements.forEach(el => el.classList.remove('selected'));
            
            // Выделяем выбранный слот
            slotElement.classList.add('selected');
            
            // Запоминаем выбранное время
            selectedTime = slotElement.getAttribute('data-time');
            
            // Проверяем возможность записи
            checkBookingAvailability();
        });
    });
}

/**
 * Проверка возможности записи на тренировку
 */
function checkBookingAvailability() {
    const bookBtn = document.querySelector('.book-btn');
    if (!bookBtn) return;
    
    // Проверяем, авторизован ли пользователь
    const token = localStorage.getItem('fitapp_token');
    
    // Кнопка доступна только авторизованным пользователям,
    // которые выбрали тренера, дату и время
    bookBtn.disabled = !token || !selectedTrainer || !selectedDate || !selectedTime;
}

/**
 * Обработка записи на тренировку
 */
function handleBooking() {
    if (!selectedTrainer || !selectedDate || !selectedTime) {
        window.FitApp.showNotification('Пожалуйста, выберите тренера, дату и время тренировки', 'warning');
        return;
    }
    
    // Форматируем данные для отправки
    const bookingData = {
        trainerId: selectedTrainer.id,
        date: window.FitApp.formatDate(selectedDate, 'yyyy-mm-dd'),
        time: selectedTime
    };
    
    // В реальном приложении здесь будет запрос к API
    // Имитируем успешную запись
    console.log('Данные для записи:', bookingData);
    
    // Показываем уведомление об успешной записи
    const formattedDate = window.FitApp.formatDate(selectedDate, 'dd.mm.yyyy');
    const message = `Вы успешно записаны на тренировку к тренеру ${selectedTrainer.name} на ${formattedDate} в ${selectedTime}!`;
    
    window.FitApp.showNotification(message, 'success');
    
    // Сбрасываем выбранные значения
    resetBookingForm();
}

/**
 * Сброс формы записи на тренировку
 */
function resetBookingForm() {
    selectedTrainer = null;
    selectedDate = null;
    selectedTime = null;
    
    // Снимаем выделение с тренеров
    const trainerItems = document.querySelectorAll('.trainer-item');
    trainerItems.forEach(item => item.classList.remove('selected'));
    
    // Снимаем выделение с дат
    const dayElements = document.querySelectorAll('.calendar-day');
    dayElements.forEach(day => day.classList.remove('selected'));
    
    // Очищаем временные слоты
    const timeSlotsContainer = document.querySelector('.time-slots');
    if (timeSlotsContainer) {
        timeSlotsContainer.innerHTML = '<p>Сначала выберите дату и тренера</p>';
    }
    
    // Блокируем кнопку записи
    const bookBtn = document.querySelector('.book-btn');
    if (bookBtn) {
        bookBtn.disabled = true;
    }
}

/**
 * Получение правильного склонения слова "лет"
 * @param {number} years - Количество лет
 * @returns {string} - Правильное склонение
 */
function getYearsWord(years) {
    const lastDigit = years % 10;
    const lastTwoDigits = years % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'лет';
    }
    
    if (lastDigit === 1) {
        return 'год';
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'года';
    }
    
    return 'лет';
}