/**
 * FitApp - auth.js
 * Скрипт для обработки авторизации и регистрации пользователей
 */

// Глобальные переменные
const API_AUTH_URL = `${API_BASE_URL}/auth`;

// Загрузка скрипта при полной загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initAuthForms();
});

/**
 * Инициализация форм авторизации
 */
function initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const resetForm = document.getElementById('resetForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (resetForm) {
        resetForm.addEventListener('submit', handlePasswordReset);
    }
    
    // Инициализация кнопок входа через соцсети
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', handleSocialLogin);
    });
}

/**
 * Обработка формы входа
 * @param {Event} e - Событие отправки формы
 */
function handleLogin(e) {
    e.preventDefault();
    
    // Сброс предыдущих ошибок
    clearErrors();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Валидация полей
    let isValid = true;
    
    if (!email) {
        showError('loginEmailError', 'Введите адрес электронной почты');
        isValid = false;
    } else if (!FitApp.isValidEmail(email)) {
        showError('loginEmailError', 'Введите корректный адрес электронной почты');
        isValid = false;
    }
    
    if (!password) {
        showError('loginPasswordError', 'Введите пароль');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Отправка запроса на сервер
    fetch(`${API_AUTH_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, rememberMe })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Ошибка входа');
            });
        }
        return response.json();
    })
    .then(data => {
        // Сохранение токена авторизации
        localStorage.setItem('fitapp_token', data.token);
        
        // Перенаправление на главную страницу
        window.location.href = '../index.html?auth=success';
    })
    .catch(error => {
        showError('loginFormError', error.message || 'Ошибка входа. Проверьте логин и пароль.');
    });
}

/**
 * Обработка формы регистрации
 * @param {Event} e - Событие отправки формы
 */
function handleRegister(e) {
    e.preventDefault();
    
    // Сброс предыдущих ошибок
    clearErrors();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Валидация полей
    let isValid = true;
    
    if (!name) {
        showError('registerNameError', 'Введите ваше имя');
        isValid = false;
    }
    
    if (!email) {
        showError('registerEmailError', 'Введите адрес электронной почты');
        isValid = false;
    } else if (!FitApp.isValidEmail(email)) {
        showError('registerEmailError', 'Введите корректный адрес электронной почты');
        isValid = false;
    }
    
    if (phone && !isValidPhone(phone)) {
        showError('registerPhoneError', 'Введите корректный номер телефона');
        isValid = false;
    }
    
    if (!password) {
        showError('registerPasswordError', 'Введите пароль');
        isValid = false;
    } else if (!FitApp.isValidPassword(password)) {
        showError('registerPasswordError', 'Пароль должен содержать минимум 8 символов, буквы и цифры');
        isValid = false;
    }
    
    if (!passwordConfirm) {
        showError('registerPasswordConfirmError', 'Повторите пароль');
        isValid = false;
    } else if (password !== passwordConfirm) {
        showError('registerPasswordConfirmError', 'Пароли не совпадают');
        isValid = false;
    }
    
    if (!agreeTerms) {
        showError('agreeTermsError', 'Необходимо принять условия использования');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Отправка запроса на сервер
    fetch(`${API_AUTH_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Ошибка регистрации');
            });
        }
        return response.json();
    })
    .then(data => {
        // Сохранение токена авторизации
        localStorage.setItem('fitapp_token', data.token);
        
        // Перенаправление на главную страницу
        window.location.href = '../index.html?auth=success&new_user=true';
    })
    .catch(error => {
        showError('registerFormError', error.message || 'Ошибка регистрации. Попробуйте позже или используйте другой email.');
    });
}

/**
 * Обработка формы сброса пароля
 * @param {Event} e - Событие отправки формы
 */
function handlePasswordReset(e) {
    e.preventDefault();
    
    // Сброс предыдущих ошибок
    clearErrors();
    
    const email = document.getElementById('resetEmail').value.trim();
    
    // Валидация поля
    if (!email) {
        showError('resetEmailError', 'Введите адрес электронной почты');
        return;
    } else if (!FitApp.isValidEmail(email)) {
        showError('resetEmailError', 'Введите корректный адрес электронной почты');
        return;
    }
    
    // Отправка запроса на сервер
    fetch(`${API_AUTH_URL}/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Ошибка сброса пароля');
            });
        }
        return response.json();
    })
    .then(data => {
        // Показываем сообщение об успешной отправке
        const resetForm = document.getElementById('resetForm');
        resetForm.innerHTML = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <h3>Инструкции отправлены</h3>
                <p>На указанный email отправлено письмо с инструкциями по сбросу пароля.</p>
                <div class="form-group">
                    <button type="button" class="btn btn-primary btn-block" id="backToLoginAfterReset">Вернуться к входу</button>
                </div>
            </div>
        `;
        
        // Добавляем обработчик для кнопки возврата к логину
        document.getElementById('backToLoginAfterReset').addEventListener('click', function() {
            // Активируем таб входа
            const authTabs = document.querySelectorAll('.auth-tab');
            const authForms = document.querySelectorAll('.auth-form');
            
            authForms.forEach(form => form.classList.remove('active'));
            document.querySelector('.login-form').classList.add('active');
            
            authTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.getAttribute('data-tab') === 'login') {
                    tab.classList.add('active');
                }
            });
        });
    })
    .catch(error => {
        showError('resetFormError', error.message || 'Ошибка отправки. Пожалуйста, попробуйте позже.');
    });
}

/**
 * Обработка входа через социальные сети
 * @param {Event} e - Событие клика
 */
function handleSocialLogin(e) {
    e.preventDefault();
    
    const provider = e.currentTarget.classList.contains('google') ? 'google' : 'facebook';
    
    // В реальном приложении здесь был бы код для OAuth авторизации
    // Для демонстрации просто показываем сообщение
    FitApp.showNotification(`Вход через ${provider} временно недоступен`, 'warning');
}

/**
 * Отображение ошибки валидации
 * @param {string} elementId - ID элемента для отображения ошибки
 * @param {string} message - Текст сообщения об ошибке
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * Очистка всех сообщений об ошибках
 */
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

/**
 * Проверка валидности номера телефона
 * @param {string} phone - Номер телефона
 * @returns {boolean} - Результат проверки
 */
function isValidPhone(phone) {
    // Базовая проверка - минимум 10 цифр
    return /^(\+|[0-9])[0-9]{9,15}$/.test(phone.replace(/[\s()-]/g, ''));
}

// Экспорт функций, если необходимо
if (typeof window.FitApp === 'object') {
    window.FitApp.auth = {
        handleLogin,
        handleRegister,
        handlePasswordReset
    };
}