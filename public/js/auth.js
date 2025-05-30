/**
 * FitApp - client/js/auth.js
 * Клиентский скрипт для обработки авторизации и регистрации пользователей
 */

// Глобальные переменные
const API_BASE_URL = 'http://localhost:3000/api'; // Обновите на ваш серверный URL
const API_AUTH_URL = `${API_BASE_URL}/auth`;

// Загрузка скрипта при полной загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initAuthForms();
    checkAuthStatus();
});

/**
 * Проверка статуса авторизации при загрузке страницы
 */
function checkAuthStatus() {
    const token = localStorage.getItem('fitapp_token');
    if (token) {
        // Проверяем валидность токена
        fetch(`${API_AUTH_URL}/verify-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                // Токен недействителен, удаляем его
                localStorage.removeItem('fitapp_token');
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data && data.success) {
                // Пользователь авторизован, можно перенаправить или обновить UI
                console.log('User is authenticated:', data.user);
            }
        })
        .catch(error => {
            console.error('Auth check error:', error);
            localStorage.removeItem('fitapp_token');
        });
    }
}

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
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    // Валидация полей
    let isValid = true;
    
    if (!email) {
        showError('loginEmailError', 'Введите адрес электронной почты');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('loginEmailError', 'Введите корректный адрес электронной почты');
        isValid = false;
    }
    
    if (!password) {
        showError('loginPasswordError', 'Введите пароль');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Показываем индикатор загрузки
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Вход...';
    submitBtn.disabled = true;
    
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
        if (data.success) {
            // Сохранение токена авторизации
            localStorage.setItem('fitapp_token', data.token);
            
            // Сохранение информации о пользователе (опционально)
            if (data.user) {
                localStorage.setItem('fitapp_user', JSON.stringify(data.user));
            }
            
            // Показываем уведомление об успехе
            showNotification('Вход выполнен успешно', 'success');
            
            // Перенаправление на главную страницу
            setTimeout(() => {
                window.location.href = '../index.html?auth=success';
            }, 1000);
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showError('loginFormError', error.message || 'Ошибка входа. Проверьте логин и пароль.');
    })
    .finally(() => {
        // Восстанавливаем кнопку
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
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
    const phone = document.getElementById('registerPhone')?.value.trim() || '';
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const agreeTerms = document.getElementById('agreeTerms')?.checked || false;
    
    // Валидация полей
    let isValid = true;
    
    if (!name) {
        showError('registerNameError', 'Введите ваше имя');
        isValid = false;
    }
    
    if (!email) {
        showError('registerEmailError', 'Введите адрес электронной почты');
        isValid = false;
    } else if (!isValidEmail(email)) {
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
    } else if (!isValidPassword(password)) {
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
    
    // Показываем индикатор загрузки
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Регистрация...';
    submitBtn.disabled = true;
    
    // Отправка запроса на сервер
    fetch(`${API_AUTH_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone: phone || null, password })
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
        if (data.success) {
            // Сохранение токена авторизации
            localStorage.setItem('fitapp_token', data.token);
            
            // Сохранение информации о пользователе
            if (data.user) {
                localStorage.setItem('fitapp_user', JSON.stringify(data.user));
            }
            
            // Показываем уведомление об успехе
            showNotification('Регистрация прошла успешно', 'success');
            
            // Перенаправление на главную страницу
            setTimeout(() => {
                window.location.href = '../index.html?auth=success&new_user=true';
            }, 1000);
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        showError('registerFormError', error.message || 'Ошибка регистрации. Попробуйте позже или используйте другой email.');
    })
    .finally(() => {
        // Восстанавливаем кнопку
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
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
    } else if (!isValidEmail(email)) {
        showError('resetEmailError', 'Введите корректный адрес электронной почты');
        return;
    }
    
    // Показываем индикатор загрузки
    const submitBtn = document.querySelector('#resetForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    // Отправка запроса на сервер
    fetch(`${API_AUTH_URL}/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
    if (data.success) {
        showNotification('Инструкции по сбросу пароля отправлены на email', 'success');
    } else {
        showError('resetFormError', data.message || 'Не удалось отправить инструкцию по сбросу.');
    }
})
.catch(error => {
    console.error('Reset error:', error);
    showError('resetFormError', error.message || 'Ошибка при отправке запроса. Попробуйте позже.');
})
.finally(() => {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
})};