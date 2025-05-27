/**
 * FitApp - exercises.js
 * JavaScript файл для работы с упражнениями
 */

// Глобальные переменные
let exercises = []; // Список упражнений
let selectedCategory = 'all'; // Выбранная категория мышц
let currentExercise = null; // Текущее открытое упражнение

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initExercisesPage();
});

/**
 * Инициализация страницы упражнений
 */
function initExercisesPage() {
    // Получаем элементы страницы
    const exercisesContainer = document.querySelector('.exercises-container');
    const categoriesContainer = document.querySelector('.categories-filter');
    const searchInput = document.querySelector('#exercise-search');
    
    // Проверяем наличие всех элементов
    if (!exercisesContainer) {
        console.error('Элемент .exercises-container не найден');
        return;
    }
    
    // Загрузим данные упражнений
    loadExercises()
        .then(() => {
            // Если есть фильтр категорий, инициализируем его
            if (categoriesContainer) {
                initCategoriesFilter(categoriesContainer);
            }
            
            // Если есть поиск, инициализируем его
            if (searchInput) {
                initSearchFilter(searchInput);
            }
            
            // Отображаем список упражнений
            renderExercises(exercisesContainer);
            
            // Проверяем хэш в URL для открытия конкретного упражнения
            checkUrlForExercise();
        })
        .catch(error => {
            console.error('Ошибка загрузки упражнений:', error);
            exercisesContainer.innerHTML = '<p class="error-message">Ошибка загрузки списка упражнений</p>';
        });
    
    // Добавляем прослушивание изменений хэша URL
    window.addEventListener('hashchange', checkUrlForExercise);
}

/**
 * Загрузка списка упражнений с сервера
 * @returns {Promise} - Promise с данными упражнений
 */
function loadExercises() {
    // Используем функцию loadData из main.js
    return window.FitApp.loadData('exercises')
        .then(data => {
            exercises = data;
            return exercises;
        })
        .catch(error => {
            // В случае ошибки загружаем тестовые данные
            console.warn('Используем тестовые данные упражнений:', error);
            
exercises = [
                {
                    id: 'squat',
                    name: 'Присідання',
                    category: 'legs',
                    categoryName: 'Ноги',
                    difficulty: 'beginners',
                    difficultyName: 'Початківець',
                    description: 'Присідання — базова вправа для нижньої частини тіла, спрямована на зміцнення м\'язів ніг та сідниць.',
                    technique: 'Поставте ноги на ширині плечей, направте носки трохи назовні. Опускайтесь, згинаючи коліна, ніби сідаєте на стілець, слідкуючи за тим, щоб коліна не виходили за носки. Опустіться до паралелі стегон з підлогою і поверніться у вихідне положення.',
                    mainMuscles: ['Квадрицепси', 'Сідничні м\'язи'],
                    additionalMuscles: ['Біцепс стегна', 'Литкові м\'язи', 'М\'язи кору'],
                    equipment: 'Не потрібно',
                    image: '../assets/images/exercises/squat.jpg',
                    gifAnimation: '../assets/gifs/squat.gif',
                    variations: [
                        'Присідання з гантелями',
                        'Присідання зі штангою',
                        'Глибокі присідання',
                        'Присідання на одній нозі'
                    ],
                    tips: [
                        'Слідкуйте за спиною — вона має бути прямою',
                        'Коліна мають бути направлені в ту ж сторону, що й носки',
                        'Для балансу можна витягнути руки вперед',
                        'Опускайтесь до паралелі стегон з підлогою або нижче'
                    ]
                },
                {
                    id: 'pushup',
                    name: 'Віджимання',
                    category: 'chest',
                    categoryName: 'Груди',
                    difficulty: 'beginners',
                    difficultyName: 'Початківець',
                    description: 'Віджимання — популярна вправа для верхньої частини тіла, яка розвиває м\'язи грудей, плечей та трицепсів.',
                    technique: 'Прийміть положення упору лежачи, руки розташуйте трохи ширше плечей, ноги разом. Опускайтесь, згинаючи руки в ліктях до кута 90 градусів, потім поверніться у вихідне положення.',
                    mainMuscles: ['Грудні м\'язи', 'Трицепси'],
                    additionalMuscles: ['Передні дельти', 'М\'язи кору', 'Передня зубчаста м\'яз'],
                    equipment: 'Не потрібно',
                    image: '../assets/images/exercises/pushup.jpg',
                    gifAnimation: '../assets/gifs/pushup.gif',
                    variations: [
                        'Віджимання з вузькою постановкою рук',
                        'Віджимання з широкою постановкою рук',
                        'Віджимання з підйомом ніг',
                        'Віджимання на одній руці'
                    ],
                    tips: [
                        'Тримайте тіло в одній площині від голови до п\'ят',
                        'Не допускайте провисання в попереку',
                        'Опускайтесь до паралелі плечей з підлогою',
                        'Повністю випрямляйте руки у верхній точці'
                    ]
                },
                {
                    id: 'plank',
                    name: 'Планка',
                    category: 'core',
                    categoryName: 'Кор',
                    difficulty: 'beginners',
                    difficultyName: 'Початківець',
                    description: 'Планка — статична вправа, яка зміцнює м\'язи кору, спини та плечового поясу.',
                    technique: 'Упірте передпліччями в підлогу, лікті під плечовими суглобами, тіло пряме. Утримуйте цю позицію, напружуючи м\'язи живота та сідниць.',
                    mainMuscles: ['Пряма м\'яз живота', 'Поперечна м\'яз живота'],
                    additionalMuscles: ['М\'язи спини', 'Сідничні м\'язи', 'Плечовий пояс'],
                    equipment: 'Не потрібно',
                    image: '../assets/images/exercises/plank.jpg',
                    gifAnimation: '../assets/gifs/plank.gif',
                    variations: [
                        'Бічна планка',
                        'Планка з піднятою рукою/ногою',
                        'Планка з підйомом на прямі руки',
                        'Динамічна планка'
                    ],
                    tips: [
                        'Не затримуйте дихання, дихайте рівно',
                        'Не допускайте провисання в попереку',
                        'Почніть з утримання 20-30 секунд',
                        'Поступово збільшуйте час утримання планки'
                    ]
                },
                {
                    id: 'pullup',
                    name: 'Підтягування',
                    category: 'back',
                    categoryName: 'Спина',
                    difficulty: 'intermediate',
                    difficultyName: 'Середній',
                    description: 'Підтягування — ефективна вправа для верхньої частини тіла, особливо для м\'язів спини та біцепсів.',
                    technique: 'Візьміться за перекладину хватом зверху на ширині плечей. З положення вису підтягуйтесь вгору, доки підборіддя не опиниться над перекладиною, потім повільно опускайтесь.',
                    mainMuscles: ['Широчайші м\'язи спини', 'Біцепси'],
                    additionalMuscles: ['Трапеції', 'Ромбоподібні м\'язи', 'Задні дельти'],
                    equipment: 'Турнік',
                    image: '../assets/images/exercises/pullup.jpg',
                    gifAnimation: '../assets/gifs/pullup.gif',
                    variations: [
                        'Підтягування зворотним хватом',
                        'Підтягування широким хватом',
                        'Підтягування вузьким хватом',
                        'Підтягування з відягощенням'
                    ],
                    tips: [
                        'Не розгойдуйтесь при підтягуванні',
                        'Повністю випрямляйте руки в нижній точці',
                        'Для початківців можна використовувати гумові петлі',
                        'Концентруйтесь на роботі м\'язів спини, а не рук'
                    ]
                },
                {
                    id: 'deadlift',
                    name: 'Станова тяга',
                    category: 'back',
                    categoryName: 'Спина',
                    difficulty: 'advanced',
                    difficultyName: 'Просунутий',
                    description: 'Станова тяга — складна базова вправа, яка залучає велику кількість м\'язів, особливо спини та ніг.',
                    technique: 'Поставте ноги на ширині плечей, присідьте і візьміться за гриф штанги. Тримаючи спину прямою, підніміться, випрямляючи коліна та стегна до повного випрямлення тіла.',
                    mainMuscles: ['Розгиначі хребта', 'Сідничні м\'язи', 'Біцепс стегна'],
                    additionalMuscles: ['Квадрицепси', 'Широчайші м\'язи спини', 'Трапеції', 'Передпліччя'],
                    equipment: 'Штанга, диски',
                    image: '../assets/images/exercises/deadlift.jpg',
                    gifAnimation: '../assets/gifs/deadlift.gif',
                    variations: [
                        'Румунська станова тяга',
                        'Станова тяга сумо',
                        'Станова тяга на прямих ногах',
                        'Станова тяга з гантелями'
                    ],
                    tips: [
                        'Тримайте спину прямою протягом усього руху',
                        'Не округляйте поперек при підйомі та опусканні штанги',
                        'Тримайте штангу близько до тіла',
                        'Почніть з легкого вагу для опанування техніки'
                    ]
                },
                {
                    id: 'bicep-curl',
                    name: 'Згинання рук на біцепс',
                    category: 'arms',
                    categoryName: 'Руки',
                    difficulty: 'beginners',
                    difficultyName: 'Початківець',
                    description: 'Згинання рук на біцепс — ізольована вправа для розвитку біцепсів.',
                    technique: 'Візьміть гантелі в руки, руки опущені вздовж тіла, долоні дивляться вперед. Згинайте руки в ліктях, піднімаючи гантелі до плечей, потім повільно опускайте.',
                    mainMuscles: ['Біцепс'],
                    additionalMuscles: ['Плечова м\'яз', 'Передпліччя'],
                    equipment: 'Гантелі або штанга',
                    image: '../assets/images/exercises/bicep-curl.jpg',
                    gifAnimation: '../assets/gifs/bicep-curl.gif',
                    variations: [
                        'Згинання рук зі штангою',
                        'Концентровані згинання',
                        'Згинання на лаві Скотта',
                        'Молоткові згинання'
                    ],
                    tips: [
                        'Тримайте лікті притиснутими до торсу',
                        'Повністю скорочуйте біцепс у верхній точці',
                        'Контролюйте опускання гантелей',
                        'Не використовуйте інерцію для підйому гантелей'
                    ]
                },
                {
                    id: 'lunge',
                    name: 'Випади',
                    category: 'legs',
                    categoryName: 'Ноги',
                    difficulty: 'beginners',
                    difficultyName: 'Початківець',
                    description: 'Випади — вправа для нижньої частини тіла, яка розвиває силу, баланс та координацію.',
                    technique: 'З положення стоячи зробіть крок вперед однією ногою і опустіться, згинаючи обидва коліна до кута 90 градусів. Поверніться у вихідне положення і повторіть з іншою ногою.',
                    mainMuscles: ['Квадрицепси', 'Сідничні м\'язи'],
                    additionalMuscles: ['Біцепс стегна', 'Литкові м\'язи', 'М\'язи кору'],
                    equipment: 'Не потрібно (можна використовувати гантелі для ускладнення)',
                    image: '../assets/images/exercises/lunge.jpg',
                    gifAnimation: '../assets/gifs/lunge.gif',
                    variations: [
                        'Зворотні випади',
                        'Бічні випади',
                        'Випади зі стрибком',
                        'Випади з гантелями'
                    ],
                    tips: [
                        'Тримайте корпус прямо',
                        'Коліно передньої ноги не повинно виходити за лінію носка',
                        'Опускайтесь досить глибоко',
                        'Слідкуйте за балансом та стійкістю'
                    ]
                },
                {
                    id: 'shoulder-press',
                    name: 'Жим гантелей над головою',
                    category: 'shoulders',
                    categoryName: 'Плечі',
                    difficulty: 'beginners',
                    difficultyName: 'Початківець',
                    description: 'Жим гантелей над головою — базова вправа для розвитку сили та розміру плечей.',
                    technique: 'Сядьте на лаву з підтримкою спини, тримаючи гантелі на рівні плечей, долоні дивляться вперед. Витисніть гантелі вгору до повного випрямлення рук, потім повільно опустіть.',
                    mainMuscles: ['Передні та середні дельти'],
                    additionalMuscles: ['Трицепси', 'Верхня частина грудей', 'Трапеції'],
                    equipment: 'Гантелі, лава (опціонально)',
                    image: '../assets/images/exercises/shoulder-press.jpg',
                    gifAnimation: '../assets/gifs/shoulder-press.gif',
                    variations: [
                        'Жим штанги над головою',
                        'Жим у тренажері',
                        'Жим стоячи',
                        'Жим Арнольда'
                    ],
                    tips: [
                        'Не прогинайте поперек',
                        'Повністю випрямляйте руки у верхній точці',
                        'Опускайте гантелі контрольовано',
                        'Для зниження навантаження на поперек можна використовувати лаву з опорою'
                    ]
                }
            ];
            
            return exercises;
        });
}

/**
 * Инициализация фильтра категорий
 * @param {HTMLElement} container - DOM-элемент для фильтра категорий
 */
function initCategoriesFilter(container) {
    // Получаем все уникальные категории из упражнений
    const categories = getUniqueCategories();
    
    // Создаем фильтр категорий
    let html = `
        <div class="category-item selected" data-category="all">Все</div>
    `;
    
    // Добавляем категории
    categories.forEach(category => {
        html += `<div class="category-item" data-category="${category.id}">${category.name}</div>`;
    });
    
    container.innerHTML = html;
    
    // Добавляем обработчики событий
    const categoryItems = container.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Снимаем выделение со всех категорий
            categoryItems.forEach(i => i.classList.remove('selected'));
            
            // Выделяем выбранную категорию
            item.classList.add('selected');
            
            // Запоминаем выбранную категорию
            selectedCategory = item.getAttribute('data-category');
            
            // Обновляем список упражнений
            const exercisesContainer = document.querySelector('.exercises-container');
            if (exercisesContainer) {
                renderExercises(exercisesContainer);
            }
        });
    });
    
    // Добавляем стили для категорий
    addCategoriesStyles();
}

/**
 * Получение уникальных категорий из упражнений
 * @returns {Array} - Массив уникальных категорий
 */
function getUniqueCategories() {
    const categoriesMap = {};
    
    exercises.forEach(exercise => {
        if (exercise.category && exercise.categoryName) {
            categoriesMap[exercise.category] = {
                id: exercise.category,
                name: exercise.categoryName
            };
        }
    });
    
    return Object.values(categoriesMap);
}

/**
 * Добавление стилей для категорий
 */
function addCategoriesStyles() {
    // Добавляем стили если их еще нет
    if (!document.getElementById('categories-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'categories-styles';
        
        styleElement.textContent = `
            .categories-filter {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .category-item {
                padding: 8px 15px;
                border-radius: var(--radius);
                background-color: #f0f0f0;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .category-item:hover {
                background-color: #e0e0e0;
            }
            
            .category-item.selected {
                background-color: var(--primary-color);
                color: white;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
}

/**
 * Инициализация поиска упражнений
 * @param {HTMLElement} searchInput - DOM-элемент для поиска
 */
function initSearchFilter(searchInput) {
    // Добавляем обработчик события ввода
    searchInput.addEventListener('input', () => {
        // Обновляем список упражнений при изменении поискового запроса
        const exercisesContainer = document.querySelector('.exercises-container');
        if (exercisesContainer) {
            renderExercises(exercisesContainer);
        }
    });
}

/**
 * Отрисовка списка упражнений
 * @param {HTMLElement} container - DOM-элемент для списка упражнений
 */
function renderExercises(container) {
    // Получаем отфильтрованные упражнения
    const filteredExercises = filterExercises();
    
    if (filteredExercises.length === 0) {
        container.innerHTML = '<p class="no-results">Упражнения не найдены</p>';
        return;
    }
    
    let html = '<div class="exercises-grid">';
    
    filteredExercises.forEach(exercise => {
        html += `
            <div class="exercise-card" data-id="${exercise.id}">
                <div class="exercise-img">
                    <img src="${exercise.image || '../assets/images/placeholder-exercise.jpg'}" alt="${exercise.name}">
                </div>
                <div class="exercise-info">
                    <h3>${exercise.name}</h3>
                    <div class="exercise-meta">
                        <span class="exercise-category">${exercise.categoryName}</span>
                        <span class="exercise-difficulty">${exercise.difficultyName}</span>
                    </div>
                    <p class="exercise-description-short">${truncateText(exercise.description, 100)}</p>
                    <a href="#${exercise.id}" class="btn btn-sm">Подробнее</a>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Добавляем стили для упражнений
    addExercisesStyles();
    
    // Добавляем обработчики для карточек упражнений
    const exerciseCards = container.querySelectorAll('.exercise-card');
    exerciseCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Если клик был не по кнопке "Подробнее", то тоже открываем детали
            if (!e.target.classList.contains('btn')) {
                const exerciseId = card.getAttribute('data-id');
                window.location.hash = exerciseId;
            }
        });
    });
}

/**
 * Фильтрация упражнений по категории и поисковому запросу
 * @returns {Array} - Отфильтрованные упражнения
 */
function filterExercises() {
    // Получаем значение поискового запроса
    const searchQuery = document.querySelector('#exercise-search')?.value.toLowerCase() || '';
    
    // Фильтруем упражнения
    return exercises.filter(exercise => {
        // Фильтрация по категории
        const categoryMatch = selectedCategory === 'all' || exercise.category === selectedCategory;
        
        // Фильтрация по поисковому запросу
        const nameMatch = exercise.name.toLowerCase().includes(searchQuery);
        const descriptionMatch = exercise.description.toLowerCase().includes(searchQuery);
        const categoryNameMatch = exercise.categoryName.toLowerCase().includes(searchQuery);
        
        return categoryMatch && (nameMatch || descriptionMatch || categoryNameMatch);
    });
}

/**
 * Проверка хэша URL для открытия конкретного упражнения
 */
function checkUrlForExercise() {
    const hash = window.location.hash.substring(1); // Убираем # из хэша
    
    if (hash) {
        const exercise = exercises.find(ex => ex.id === hash);
        
        if (exercise) {
            openExerciseDetails(exercise);
        }
    } else {
        // Если хэш пустой, скрываем детали упражнения
        closeExerciseDetails();
    }
}

/**
 * Открытие детальной информации об упражнении
 * @param {Object} exercise - Объект упражнения
 */
function openExerciseDetails(exercise) {
    currentExercise = exercise;
    
    // Создаем модальное окно, если его еще нет
    let exerciseModal = document.querySelector('.exercise-modal');
    
    if (!exerciseModal) {
        exerciseModal = document.createElement('div');
        exerciseModal.className = 'exercise-modal';
        document.body.appendChild(exerciseModal);
    }
    
    // Заполняем модальное окно информацией об упражнении
    let html = `
        <div class="exercise-modal-content">
            <div class="exercise-modal-header">
                <h2>${exercise.name}</h2>
                <button class="exercise-modal-close">&times;</button>
            </div>
            <div class="exercise-modal-body">
                <div class="exercise-media">
                    <div class="exercise-image">
                        <img src="${exercise.image || '../assets/images/placeholder-exercise.jpg'}" alt="${exercise.name}">
                    </div>
                    ${exercise.gifAnimation ? `
                        <div class="exercise-animation">
                            <img src="${exercise.gifAnimation}" alt="${exercise.name} анимация">
                        </div>
                    ` : ''}
                </div>
                
                <div class="exercise-details">
                    <div class="exercise-meta-tags">
                        <span class="exercise-category-tag">${exercise.categoryName}</span>
                        <span class="exercise-difficulty-tag">${exercise.difficultyName}</span>
                        ${exercise.equipment ? `<span class="exercise-equipment-tag">${exercise.equipment}</span>` : ''}
                    </div>
                    
                    <div class="exercise-section">
                        <h3>Описание</h3>
                        <p>${exercise.description}</p>
                    </div>
                    
                    <div class="exercise-section">
                        <h3>Техника выполнения</h3>
                        <p>${exercise.technique}</p>
                    </div>
                    
                    <div class="exercise-section">
                        <h3>Задействованные мышцы</h3>
                        <div class="muscles-groups">
                            <div class="muscles-primary">
                                <h4>Основные мышцы</h4>
                                <ul>
                                    ${exercise.mainMuscles.map(muscle => `<li>${muscle}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="muscles-secondary">
                                <h4>Дополнительные мышцы</h4>
                                <ul>
                                    ${exercise.additionalMuscles.map(muscle => `<li>${muscle}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    ${exercise.variations ? `
                        <div class="exercise-section">
                            <h3>Варианты упражнения</h3>
                            <ul class="variations-list">
                                ${exercise.variations.map(variation => `<li>${variation}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${exercise.tips ? `
                        <div class="exercise-section">
                            <h3>Советы</h3>
                            <ul class="tips-list">
                                ${exercise.tips.map(tip => `<li>${tip}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    exerciseModal.innerHTML = html;
    
    // Добавляем стили для модального окна
    addModalStyles();
    
    // Показываем модальное окно
    setTimeout(() => {
        exerciseModal.classList.add('open');
    }, 10);
    
    // Добавляем обработчик закрытия
    const closeButton = exerciseModal.querySelector('.exercise-modal-close');
    closeButton.addEventListener('click', () => {
        closeExerciseDetails();
    });
    
    // Закрытие по клику вне контента
    exerciseModal.addEventListener('click', (e) => {
        if (e.target === exerciseModal) {
            closeExerciseDetails();
        }
    });
    
    // Запрещаем прокрутку страницы
    document.body.style.overflow = 'hidden';
}

/**
 * Закрытие детальной информации об упражнении
 */
function closeExerciseDetails() {
    const exerciseModal = document.querySelector('.exercise-modal');
    
    if (exerciseModal) {
        exerciseModal.classList.remove('open');
        
        // Небольшая задержка перед удалением модального окна для анимации
        setTimeout(() => {
            exerciseModal.remove();
        }, 300);
        
        // Очищаем хэш в URL
        history.pushState("", document.title, window.location.pathname + window.location.search);
        
        // Разрешаем прокрутку страницы
        document.body.style.overflow = '';
        
        // Сбрасываем текущее упражнение
        currentExercise = null;
    }
}

/**
 * Добавление стилей для упражнений
 */
function addExercisesStyles() {
    // Добавляем стили если их еще нет
    if (!document.getElementById('exercises-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'exercises-styles';
        
        styleElement.textContent = `
            .exercises-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .exercise-card {
                border-radius: var(--radius);
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                cursor: pointer;
                background-color: #fff;
            }
            
            .exercise-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
            }
            
            .exercise-img {
                height: 200px;
                overflow: hidden;
            }
            
            .exercise-img img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .exercise-card:hover .exercise-img img {
                transform: scale(1.05);
            }
            
            .exercise-info {
                padding: 15px;
            }
            
            .exercise-info h3 {
                margin-top: 0;
                margin-bottom: 10px;
                font-size: 18px;
            }
            
            .exercise-meta {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
                font-size: 14px;
            }
            
            .exercise-category {
                background-color: var(--primary-color-light);
                color: var(--primary-color-dark);
                padding: 3px 8px;
                border-radius: 4px;
            }
            
            .exercise-difficulty {
                background-color: #f0f0f0;
                padding: 3px 8px;
                border-radius: 4px;
            }
            
            .exercise-description-short {
                color: #666;
                margin-bottom: 15px;
                font-size: 14px;
                line-height: 1.4;
            }

            .no-results {
                text-align: center;
                padding: 30px;
                color: #666;
                font-size: 16px;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
}

/**
 * Добавление стилей для модального окна
 */
function addModalStyles() {
    // Добавляем стили если их еще нет
    if (!document.getElementById('modal-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'modal-styles';
        
        styleElement.textContent = `
            .exercise-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s;
            }
            
            .exercise-modal.open {
                opacity: 1;
                visibility: visible;
            }
            
            .exercise-modal-content {
                background-color: #fff;
                width: 90%;
                max-width: 1000px;
                max-height: 90vh;
                border-radius: var(--radius);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .exercise-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #eee;
            }
            
            .exercise-modal-header h2 {
                margin: 0;
                font-size: 24px;
            }
            
            .exercise-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #777;
                transition: color 0.2s ease;
            }
            
            .exercise-modal-close:hover {
                color: var(--primary-color);
            }
            
            .exercise-modal-body {
                padding: 20px;
                overflow-y: auto;
                max-height: calc(90vh - 68px);
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            /* Медиа и изображения */
            .exercise-media {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .exercise-image,
            .exercise-animation {
                flex: 1;
                min-width: 250px;
                border-radius: var(--radius);
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .exercise-image img,
            .exercise-animation img {
                width: 100%;
                height: auto;
                display: block;
            }
            
            /* Детали упражнения */
            .exercise-meta-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .exercise-category-tag,
            .exercise-difficulty-tag,
            .exercise-equipment-tag {
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .exercise-category-tag {
                background-color: var(--primary-color);
                color: white;
            }
            
            .exercise-difficulty-tag {
                background-color: #f0f0f0;
                color: #333;
            }
            
            .exercise-equipment-tag {
                background-color: #e6f2ff;
                color: #0066cc;
            }
            
            .exercise-section {
                margin-bottom: 25px;
            }
            
            .exercise-section h3 {
                margin-top: 0;
                margin-bottom: 15px;
                font-size: 20px;
                color: var(--primary-color);
            }
            
            .exercise-section p {
                margin-top: 0;
                line-height: 1.6;
            }
            
            /* Мышечные группы */
            .muscles-groups {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
            }
            
            .muscles-primary,
            .muscles-secondary {
                flex: 1;
                min-width: 250px;
            }
            
            .muscles-groups h4 {
                margin-top: 0;
                margin-bottom: 10px;
                font-size: 16px;
            }
            
            .muscles-groups ul {
                margin-top: 0;
                padding-left: 20px;
            }
            
            .muscles-groups li {
                margin-bottom: 5px;
            }
            
            /* Вариации и советы */
            .variations-list,
            .tips-list {
                padding-left: 20px;
            }
            
            .variations-list li,
            .tips-list li {
                margin-bottom: 8px;
                line-height: 1.5;
            }
            
            /* Адаптив */
            @media (max-width: 768px) {
                .exercise-modal-content {
                    width: 95%;
                }
                
                .exercise-modal-body {
                    padding: 15px;
                }
                
                .exercise-media {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    }
}

/**
 * Обрезка текста до определенной длины
 * @param {string} text - Исходный текст
 * @param {number} maxLength - Максимальная длина
 * @returns {string} - Обрезанный текст
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    
    if (text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength) + '...';
}

/**
 * Добавление упражнения в избранное
 * @param {string} exerciseId - ID упражнения
 */
function addToFavorites(exerciseId) {
    // Проверяем, авторизован ли пользователь
    if (!currentUser) {
        window.FitApp.showNotification('Увійдіть в систему, щоб додати вправу до вибраного', 'warning');
        return;
    }
    
    // Получаем текущие избранные упражнения
    let favorites = JSON.parse(localStorage.getItem('fitapp_favorites') || '[]');
    
    // Проверяем, есть ли уже это упражнение в избранном
    if (!favorites.includes(exerciseId)) {
        favorites.push(exerciseId);
        localStorage.setItem('fitapp_favorites', JSON.stringify(favorites));
        window.FitApp.showNotification('Вправу додано до вибраного', 'success');
    } else {
        window.FitApp.showNotification('Вправа вже в обраному', 'info');
    }
}

/**
 * Удаление упражнения из избранного
 * @param {string} exerciseId - ID упражнения
 */
function removeFromFavorites(exerciseId) {
    // Получаем текущие избранные упражнения
    let favorites = JSON.parse(localStorage.getItem('fitapp_favorites') || '[]');
    
    // Удаляем упражнение из избранного
    const index = favorites.indexOf(exerciseId);
    if (index !== -1) {
        favorites.splice(index, 1);
        localStorage.setItem('fitapp_favorites', JSON.stringify(favorites));
        window.FitApp.showNotification('Вправу видалено з обраного', 'success');
        
        // Обновляем страницу избранного, если мы на ней
        if (window.location.pathname.includes('favorites.html')) {
            renderFavoriteExercises();
        }
    }
}

/**
 * Проверка, находится ли упражнение в избранном
 * @param {string} exerciseId - ID упражнения
 * @returns {boolean} - Результат проверки
 */
function isInFavorites(exerciseId) {
    const favorites = JSON.parse(localStorage.getItem('fitapp_favorites') || '[]');
    return favorites.includes(exerciseId);
}

/**
 * Отрисовка избранных упражнений
 */
function renderFavoriteExercises() {
    const container = document.querySelector('.favorites-container');
    if (!container) return;
    
    // Получаем избранные упражнения
    const favoriteIds = JSON.parse(localStorage.getItem('fitapp_favorites') || '[]');
    
    if (favoriteIds.length === 0) {
        container.innerHTML = '<p class="no-results">У вас пока нет избранных упражнений</p>';
        return;
    }
    
    // Фильтруем упражнения по ID из избранного
    const favoriteExercises = exercises.filter(ex => favoriteIds.includes(ex.id));
    
    let html = '<div class="exercises-grid">';
    
    favoriteExercises.forEach(exercise => {
        html += `
            <div class="exercise-card" data-id="${exercise.id}">
                <div class="exercise-img">
                    <img src="${exercise.image || '../assets/images/placeholder-exercise.jpg'}" alt="${exercise.name}">
                </div>
                <div class="exercise-info">
                    <h3>${exercise.name}</h3>
                    <div class="exercise-meta">
                        <span class="exercise-category">${exercise.categoryName}</span>
                        <span class="exercise-difficulty">${exercise.difficultyName}</span>
                    </div>
                    <p class="exercise-description-short">${truncateText(exercise.description, 100)}</p>
                    <div class="exercise-actions">
                        <a href="#${exercise.id}" class="btn btn-sm">Подробнее</a>
                        <button class="btn btn-sm btn-outline remove-favorite" data-id="${exercise.id}">Удалить из избранного</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Добавляем стили для упражнений
    addExercisesStyles();
    
    // Добавляем обработчики для карточек упражнений
    const exerciseCards = container.querySelectorAll('.exercise-card');
    exerciseCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Если клик не по кнопкам
            if (!e.target.classList.contains('btn')) {
                const exerciseId = card.getAttribute('data-id');
                window.location.hash = exerciseId;
            }
        });
    });
    
    // Добавляем обработчики для кнопок удаления из избранного
    const removeButtons = container.querySelectorAll('.remove-favorite');
    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const exerciseId = button.getAttribute('data-id');
            removeFromFavorites(exerciseId);
        });
    });
}

/**
 * Добавление кнопки "В избранное" в модальное окно упражнения
 * @param {HTMLElement} modalHeader - Заголовок модального окна
 * @param {string} exerciseId - ID упражнения
 */
function addFavoriteButton(modalHeader, exerciseId) {
    // Проверяем, авторизован ли пользователь
    if (!currentUser) return;
    
    // Проверяем, есть ли уже кнопка избранного
    if (modalHeader.querySelector('.favorite-btn')) return;
    
    // Создаем кнопку
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'favorite-btn';
    favoriteBtn.setAttribute('data-id', exerciseId);
    
    // Проверяем, в избранном ли упражнение
    const isFavorite = isInFavorites(exerciseId);
    
    favoriteBtn.innerHTML = isFavorite ? 
        '<i class="fas fa-heart"></i> В избранном' : 
        '<i class="far fa-heart"></i> В избранное';
    
    favoriteBtn.style.border = 'none';
    favoriteBtn.style.background = isFavorite ? '#ff4757' : '#f0f0f0';
    favoriteBtn.style.color = isFavorite ? 'white' : '#333';
    favoriteBtn.style.padding = '8px 15px';
    favoriteBtn.style.borderRadius = '4px';
    favoriteBtn.style.cursor = 'pointer';
    favoriteBtn.style.marginRight = '10px';
    favoriteBtn.style.display = 'flex';
    favoriteBtn.style.alignItems = 'center';
    favoriteBtn.style.gap = '5px';
    favoriteBtn.style.transition = 'all 0.2s ease';
    
    // Добавляем обработчик события
    favoriteBtn.addEventListener('click', () => {
        if (isInFavorites(exerciseId)) {
            removeFromFavorites(exerciseId);
            favoriteBtn.innerHTML = '<i class="far fa-heart"></i> В избранное';
            favoriteBtn.style.background = '#f0f0f0';
            favoriteBtn.style.color = '#333';
        } else {
            addToFavorites(exerciseId);
            favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> В избранном';
            favoriteBtn.style.background = '#ff4757';
            favoriteBtn.style.color = 'white';
        }
    });
    
    // Добавляем кнопку в заголовок
    modalHeader.insertBefore(favoriteBtn, modalHeader.querySelector('.exercise-modal-close'));
}

/**
 * Экспорт функций в глобальный объект
 */
window.FitApp = window.FitApp || {};
window.FitApp.Exercises = {
    initExercisesPage,
    loadExercises,
    filterExercises,
    openExerciseDetails,
    closeExerciseDetails,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    renderFavoriteExercises
};