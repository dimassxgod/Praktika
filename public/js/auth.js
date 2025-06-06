document.addEventListener('DOMContentLoaded', function() {
    // Обработка формы входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Помилка входу');
                }
                
                // Сохраняем токен в localStorage
                localStorage.setItem('fitapp_token', data.token);
                
                // Показываем уведомление и перенаправляем
                FitApp.showNotification('Успішний вхід у систему', 'success');
                setTimeout(() => {
                    window.location.href = '/profile';
                }, 1500);
                
            } catch (error) {
                document.getElementById('loginFormError').textContent = error.message;
                FitApp.showNotification(error.message, 'error');
            }
        });
    }
    
    // Обработка формы регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const phone = document.getElementById('registerPhone').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // Валидация
            if (!agreeTerms) {
                document.getElementById('agreeTermsError').textContent = 'Необхідно прийняти умови використання';
                return;
            }
            
            if (password !== passwordConfirm) {
                document.getElementById('registerPasswordConfirmError').textContent = 'Паролі не збігаються';
                return;
            }
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, phone, password, passwordConfirm })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Помилка реєстрації');
                }
                
                // Сохраняем токен в localStorage
                localStorage.setItem('fitapp_token', data.token);
                
                // Показываем уведомление и перенаправляем
                FitApp.showNotification('Реєстрація пройшла успішно!', 'success');
                setTimeout(() => {
                    window.location.href = '/profile';
                }, 1500);
                
            } catch (error) {
                document.getElementById('registerFormError').textContent = error.message;
                FitApp.showNotification(error.message, 'error');
            }
        });
    }
    
    // Обработка формы восстановления пароля
    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
        resetForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').value;
            
            try {
                const response = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Ошибка восстановления пароля');
                }
                
                FitApp.showNotification(data.message, 'success');
                
            } catch (error) {
                document.getElementById('resetFormError').textContent = error.message;
                FitApp.showNotification(error.message, 'error');
            }
        });
    }
});