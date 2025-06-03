/**
 * FitApp - main.js
 * Основной JavaScript файл для функциональности сайта
 */

// Глобальные переменные
const API_BASE_URL = window.location.origin + '/api'; // Динамический URL для API
let currentUser = null; // Текущий пользователь

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupMobileMenu();
    checkAuth();
    loadPopularExercises();
});

/**
 * Инициализация приложения
 */
function initApp() {
    console.log('FitApp initialized');
    
    // Заполнение актуальным годом в футере
    updateFooterYear();
    
    // Проверка наличия параметров в URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('auth') && urlParams.get('auth') === 'success') {
        showNotification('Вы успешно авторизовались!', 'success');
        // Очистка URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Обработчик для плавного скролла
    setupSmoothScroll();
}

/**
 * Настройка плавного скролла для якорных ссылок
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                smoothScrollTo(target, 80);
            }
        });
    });
}

/**
 * Настройка мобильного меню
 */
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            
            // Изменение иконки меню
            const icon = mobileMenuBtn.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Закрытие мобильного меню при клике на пункт меню
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    mainNav.classList.remove('active');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mainNav.contains(e.target)) {
                mainNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

/**
 * Проверка авторизации пользователя
 */
async function checkAuth() {
    const token = localStorage.getItem('fitapp_token');
    
    if (token) {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/auth/me`);
            
            if (response.ok) {
                const userData = await response.json();
                currentUser = userData.user || userData;
                updateUIForLoggedInUser(currentUser);
            } else {
                throw new Error('Ошибка авторизации');
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            localStorage.removeItem('fitapp_token');
            updateUIForLoggedOutUser();
        }
    } else {
        updateUIForLoggedOutUser();
    }
}

/**
 * Обновление интерфейса для авторизованного пользователя
 */
function updateUIForLoggedInUser(user) {
    // Обновление кнопки входа в меню
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.textContent = user.name || user.firstName || 'Личный кабинет';
        loginBtn.href = '/profile';
        loginBtn.classList.add('logged-in');
    }
    
    // Обновление блока записи на тренировку
    const bookingNotice = document.querySelector('.login-notice');
    const bookBtn = document.querySelector('.book-btn');
    
    if (bookingNotice) {
        bookingNotice.style.display = 'none';
    }
    
    if (bookBtn) {
        bookBtn.disabled = false;
        bookBtn.addEventListener('click', handleBookingClick);
    }
}

/**
 * Обновление интерфейса для неавторизованного пользователя
 */
function updateUIForLoggedOutUser() {
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.textContent = 'Увійти';
        loginBtn.href = '/auth';
        loginBtn.classList.remove('logged-in');
    }
    
    // Обновление блока записи на тренировку
    const bookingNotice = document.querySelector('.login-notice');
    const bookBtn = document.querySelector('.book-btn');
    
    if (bookingNotice) {
        bookingNotice.style.display = 'block';
    }
    
    if (bookBtn) {
        bookBtn.disabled = true;
        bookBtn.removeEventListener('click', handleBookingClick);
    }
}

/**
 * Обработчик клика по кнопке записи
 */
function handleBookingClick() {
    if (!currentUser) {
        showNotification('Необходимо войти в систему', 'warning');
        return;
    }
    
    // Логика записи на тренировку
    showNotification('Функция записи в разработке', 'info');
}

/**
 * Загрузка популярных упражнений
 */
async function loadPopularExercises() {
    try {
        const response = await fetch(`${API_BASE_URL}/content/exercises/popular`);
        
        if (response.ok) {
            const exercises = await response.json();
            renderPopularExercises(exercises);
        } else {
            console.warn('Не удалось загрузить популярные упражнения');
        }
    } catch (error) {
        console.error('Ошибка загрузки упражнений:', error);
    }
}

/**
 * Отображение популярных упражнений
 */
function renderPopularExercises(exercises) {
    const exercisesGrid = document.querySelector('.exercises-grid');
    
    if (!exercisesGrid || !exercises || exercises.length === 0) {
        return;
    }
    
    exercisesGrid.innerHTML = exercises.map(exercise => `
        <div class="exercise-card">
            <div class="exercise-img">
                <img src="${exercise.image || 'assets/images/exercises/default.jpg'}" 
                     alt="${exercise.name}" 
                     onerror="this.src='assets/images/exercises/default.jpg'">
            </div>
            <div class="exercise-info">
                <h3>${exercise.name}</h3>
                <p>Група м'язів: ${exercise.muscleGroup}</p>
                <a href="pages/exercises.html#${exercise.slug}" class="btn btn-sm">Докладніше</a>
            </div>
        </div>
    `).join('');
}

/**
 * Выход из системы
 */

function logout() {
    localStorage.removeItem('fitapp_token');
    currentUser = null;
    showNotification('Вы вышли из системы', 'success');
    
    // Обновляем UI
    updateUIForLoggedOutUser();
    
    // Перенаправление на главную страницу
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

/**
 * Выполнение запроса с авторизацией
 */
function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('fitapp_token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    if (token) {
        defaultOptions.headers.Authorization = `Bearer ${token}`;
    }
    
    return fetch(url, { ...defaultOptions, ...options });
}

/**
 * Показ уведомления
 */
function showNotification(message, type = 'info') {
    // Проверяем, существует ли уже контейнер для уведомлений
    let notificationsContainer = document.querySelector('.notifications-container');
    
    // Если контейнера нет, создаем его
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'notifications-container';
        notificationsContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
        `;
        document.body.appendChild(notificationsContainer);
    }
    
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FFC107',
        info: '#2196F3'
    };
    
    notification.style.cssText = `
        background-color: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        line-height: 1.4;
    `;
    
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close" style="
            border: none;
            background: transparent;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin-left: 15px;
            opacity: 0.8;
        ">&times;</button>
    `;
    
    // Добавляем уведомление в контейнер
    notificationsContainer.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Добавляем обработчик для кнопки закрытия
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Добавляем hover эффект для кнопки закрытия
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.opacity = '1';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.opacity = '0.8';
    });
    
    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
}

/**
 * Закрытие уведомления
 */
function closeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
        
        // Проверяем, остались ли еще уведомления
        const notificationsContainer = document.querySelector('.notifications-container');
        if (notificationsContainer && notificationsContainer.children.length === 0) {
            notificationsContainer.remove();
        }
    }, 300);
}

/**
 * Обновление года в футере
 */
function updateFooterYear() {
    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.innerHTML = `&copy; ${currentYear} FitApp. Усі права захищені.`;
    }
}

/**
 * Загрузка данных с API
 */
async function loadData(endpoint, requireAuth = false) {
    try {
        const url = `${API_BASE_URL}/${endpoint}`;
        const response = requireAuth ? 
            await fetchWithAuth(url) : 
            await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        throw error;
    }
}

/**
 * Сглаживание скролла к элементу
 */
function smoothScrollTo(element, offset = 0) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

/**
 * Форматирование даты
 */
function formatDate(date, format = 'dd.mm.yyyy') {
    date = new Date(date);
    
    if (isNaN(date.getTime())) {
        return 'Неверная дата';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    switch (format) {
        case 'dd.mm.yyyy':
            return `${day}.${month}.${year}`;
        case 'yyyy-mm-dd':
            return `${year}-${month}-${day}`;
        case 'dd.mm.yyyy hh:mm':
            return `${day}.${month}.${year} ${hours}:${minutes}`;
        default:
            return `${day}.${month}.${year}`;
    }
}

/**
 * Проверка валидности электронной почты
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Проверка валидности пароля
 */
function isValidPassword(password) {
    // Минимум 8 символов, содержит буквы и цифры
    return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

/**
 * Debounce функция для оптимизации событий
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Экспорт функций и переменных для глобального использования
 */
window.FitApp = {
    // Основные функции
    logout,
    showNotification,
    loadData,
    smoothScrollTo,
    checkAuth,
    
    // Утилиты
    formatDate,
    isValidEmail,
    isValidPassword,
    fetchWithAuth,
    debounce,
    
    // Переменные
    get currentUser() {
        return currentUser;
    },
    
    get apiBaseUrl() {
        return API_BASE_URL;
    }
};