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
    
    // Загрузка данных пользователя
    loadUserData();
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