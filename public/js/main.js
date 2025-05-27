/**
 * FitApp - main.js
 * Основной JavaScript файл для функциональности сайта
 */

// Глобальные переменные
const API_BASE_URL = 'http://localhost:3000/api'; // URL для API запросов
let currentUser = null; // Текущий пользователь

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupMobileMenu();
    checkAuth();
});

/**
 * Инициализация приложения
 */
function initApp() {
    console.log('FitApp initialized');
    
    // Заполнение актуальным годом в футере
    updateFooterYear();
    
    // Проверка наличия параметров в URL (для обработки возврата после авторизации)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('auth') && urlParams.get('auth') === 'success') {
        showNotification('Вы успешно авторизовались!', 'success');
    }
}

/**
 * Настройка мобильного меню
 */
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuBtn) {
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
    }
}

/**
 * Проверка авторизации пользователя
 */
function checkAuth() {
    const token = localStorage.getItem('fitapp_token');
    
    if (token) {
        // Получение данных текущего пользователя
        fetchWithAuth(`${API_BASE_URL}/users/me`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Ошибка авторизации');
            })
            .then(user => {
                currentUser = user;
                updateUIForLoggedInUser(user);
            })
            .catch(error => {
                console.error('Ошибка проверки авторизации:', error);
                // При ошибке удаляем токен
                localStorage.removeItem('fitapp_token');
                updateUIForLoggedOutUser();
            });
    } else {
        updateUIForLoggedOutUser();
    }
}

/**
 * Обновление интерфейса для авторизованного пользователя
 * @param {Object} user - Данные пользователя
 */
function updateUIForLoggedInUser(user) {
    // Обновление кнопки входа в меню
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.textContent = user.name || 'Личный кабинет';
        loginBtn.href = 'pages/profile.html';
    }
    
    // Обновление блока записи на тренировку
    const bookingNotice = document.querySelector('.login-notice');
    const bookBtn = document.querySelector('.book-btn');
    
    if (bookingNotice) {
        bookingNotice.style.display = 'none';
    }
    
    if (bookBtn) {
        bookBtn.disabled = false;
    }
}

/**
 * Обновление интерфейса для неавторизованного пользователя
 */
function updateUIForLoggedOutUser() {
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.textContent = 'Увійти';
    }
    
    // Обновление блока записи на тренировку
    const bookingNotice = document.querySelector('.login-notice');
    const bookBtn = document.querySelector('.book-btn');
    
    if (bookingNotice) {
        bookingNotice.style.display = 'block';
    }
    
    if (bookBtn) {
        bookBtn.disabled = true;
    }
}

/**
 * Выход из системы
 */
function logout() {
    localStorage.removeItem('fitapp_token');
    currentUser = null;
    
    // Перенаправление на главную страницу
    window.location.href = '/';
}

/**
 * Выполнение запроса с авторизацией
 * @param {string} url - URL запроса
 * @param {Object} options - Опции запроса
 * @returns {Promise} - Promise с результатом запроса
 */
function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('fitapp_token');
    
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    
    return fetch(url, options);
}

/**
 * Показ уведомления
 * @param {string} message - Текст уведомления
 * @param {string} type - Тип уведомления (success, error, warning)
 */
function showNotification(message, type = 'info') {
    // Проверяем, существует ли уже контейнер для уведомлений
    let notificationsContainer = document.querySelector('.notifications-container');
    
    // Если контейнера нет, создаем его
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'notifications-container';
        document.body.appendChild(notificationsContainer);
        
        // Стили для контейнера уведомлений
        notificationsContainer.style.position = 'fixed';
        notificationsContainer.style.top = '20px';
        notificationsContainer.style.right = '20px';
        notificationsContainer.style.zIndex = '1000';
    }
    
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Стили для уведомления
    notification.style.backgroundColor = type === 'success' ? '#4CAF50' : 
                                       type === 'error' ? '#F44336' :
                                       type === 'warning' ? '#FFC107' : '#2196F3';
    notification.style.color = 'white';
    notification.style.padding = '15px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    notification.style.minWidth = '300px';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    
    // Добавляем уведомление в контейнер
    notificationsContainer.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Добавляем обработчик для кнопки закрытия
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'transparent';
    closeBtn.style.color = 'white';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.float = 'right';
    
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
}

/**
 * Закрытие уведомления
 * @param {HTMLElement} notification - Элемент уведомления
 */
function closeNotification(notification) {
    notification.style.opacity = '0';
    
    setTimeout(() => {
        notification.remove();
        
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
        yearElement.innerHTML = `&copy; ${currentYear} FitApp. Все права защищены.`;
    }
}

/**
 * Загрузка данных с API
 * @param {string} endpoint - Конечная точка API
 * @param {boolean} requireAuth - Требуется ли авторизация
 * @returns {Promise} - Promise с данными
 */
function loadData(endpoint, requireAuth = false) {
    const url = `${API_BASE_URL}/${endpoint}`;
    
    if (requireAuth) {
        return fetchWithAuth(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка загрузки данных');
                }
                return response.json();
            });
    } else {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка загрузки данных');
                }
                return response.json();
            });
    }
}

/**
 * Сглаживание скролла к элементу
 * @param {HTMLElement|string} element - Элемент или его селектор
 * @param {number} offset - Отступ от верха страницы
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
 * @param {Date|string} date - Дата для форматирования
 * @param {string} format - Формат (default: 'dd.mm.yyyy')
 * @returns {string} - Отформатированная дата
 */
function formatDate(date, format = 'dd.mm.yyyy') {
    date = new Date(date);
    
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
 * @param {string} email - Адрес электронной почты
 * @returns {boolean} - Результат проверки
 */
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Проверка валидности пароля
 * @param {string} password - Пароль
 * @returns {boolean} - Результат проверки
 */
function isValidPassword(password) {
    // Минимум 8 символов, содержит буквы и цифры
    return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

/**
 * Экспорт функций и переменных
 */
window.FitApp = {
    logout,
    showNotification,
    loadData,
    smoothScrollTo,
    formatDate,
    isValidEmail,
    isValidPassword,
    fetchWithAuth,
    checkAuth
};