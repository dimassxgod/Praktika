/**
 * FitApp - server/models/User.js
 * Модель пользователя для MongoDB
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Имя пользователя обязательно'],
        trim: true,
        minlength: [2, 'Имя должно содержать минимум 2 символа'],
        maxlength: [50, 'Имя не должно превышать 50 символов']
    },
    
    email: {
        type: String,
        required: [true, 'Email обязателен'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Некорректный формат email']
    },
    
    phone: {
        type: String,
        trim: true,
        default: null,
        validate: {
            validator: function(v) {
                // Если телефон указан, он должен быть валидным
                return !v || /^(\+|[0-9])[0-9]{9,15}$/.test(v.replace(/[\s()-]/g, ''));
            },
            message: 'Некорректный формат номера телефона'
        }
    },
    
    password: {
        type: String,
        required: [true, 'Пароль обязателен'],
        minlength: [8, 'Пароль должен содержать минимум 8 символов']
    },
    
    role: {
        type: String,
        enum: ['user', 'trainer', 'admin'],
        default: 'user'
    },
    
    isActive: {
        type: Boolean,
        default: true
    },
    
    avatar: {
        type: String,
        default: null
    },
    
    // Поля для сброса пароля
    resetPasswordToken: {
        type: String,
        default: null
    },
    
    resetPasswordExpiry: {
        type: Date,
        default: null
    },
    
    // Фитнес-профиль пользователя
    profile: {
        dateOfBirth: {
            type: Date,
            default: null
        },
        
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            default: null
        },
        
        height: {
            type: Number,
            min: [100, 'Рост не может быть меньше 100 см'],
            max: [250, 'Рост не может быть больше 250 см'],
            default: null
        },
        
        weight: {
            type: Number,
            min: [30, 'Вес не может быть меньше 30 кг'],
            max: [300, 'Вес не может быть больше 300 кг'],
            default: null
        },
        
        fitnessLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        },
        
        goals: [{
            type: String,
            enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness']
        }],
        
        medicalNotes: {
            type: String,
            maxlength: [500, 'Медицинские заметки не должны превышать 500 символов'],
            default: null
        }
    },
    
    // Статистика
    stats: {
        totalWorkouts: {
            type: Number,
            default: 0
        },
        
        totalHours: {
            type: Number,
            default: 0
        },
        
        favoriteTrainers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        
        completedWorkouts: [{
            workout: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Workout'
            },
            completedAt: {
                type: Date,
                default: Date.now
            },
            duration: {
                type: Number, // в минутах
                default: 0
            },
            caloriesBurned: {
                type: Number,
                default: 0
            }
        }],
        
        weeklyGoal: {
            workouts: {
                type: Number,
                default: 3
            },
            hours: {
                type: Number,
                default: 3
            }
        },
        
        achievements: [{
            name: String, // Название достижения
            description: String,
            earnedAt: {
                type: Date,
                default: Date.now
            },
            icon: String // URL иконки достижения
        }]
    },
    
    // Настройки уведомлений
    notifications: {
        email: {
            type: Boolean,
            default: true
        },
        
        push: {
            type: Boolean,
            default: true
        },
        
        workoutReminders: {
            type: Boolean,
            default: true
        },
        
        progressUpdates: {
            type: Boolean,
            default: true
        }
    },
    
    // История весов
    weightHistory: [{
        weight: {
            type: Number,
            required: true
        },
        recordedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Подписки (если есть premium функции)
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'premium', 'pro'],
            default: 'free'
        },
        
        startDate: {
            type: Date,
            default: null
        },
        
        endDate: {
            type: Date,
            default: null
        },
        
        isActive: {
            type: Boolean,
            default: false
        }
    },
    
    // Токены для мобильных push-уведомлений
    deviceTokens: [{
        token: String,
        platform: {
            type: String,
            enum: ['ios', 'android', 'web']
        },
        lastUsed: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Последний вход
    lastLogin: {
        type: Date,
        default: Date.now
    },
    
    // IP адрес последнего входа (для безопасности)
    lastLoginIP: {
        type: String,
        default: null
    }
    
}, {
    timestamps: true, // Автоматически добавляет createdAt и updatedAt
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.resetPasswordToken;
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

// Виртуальные поля
userSchema.virtual('age').get(function() {
    if (!this.profile.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.profile.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
});

userSchema.virtual('bmi').get(function() {
    if (!this.profile.height || !this.profile.weight) return null;
    const heightInMeters = this.profile.height / 100;
    return Math.round((this.profile.weight / (heightInMeters * heightInMeters)) * 10) / 10;
});

userSchema.virtual('currentWeight').get(function() {
    if (!this.weightHistory || this.weightHistory.length === 0) {
        return this.profile.weight;
    }
    
    // Возвращаем последний записанный вес
    const sortedHistory = this.weightHistory.sort((a, b) => b.recordedAt - a.recordedAt);
    return sortedHistory[0].weight;
});

// Индексы для оптимизации поиска
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ lastLogin: -1 });

// Pre-save middleware для хеширования пароля
userSchema.pre('save', async function(next) {
    // Хешируем пароль только если он был изменен
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Ошибка при сравнении паролей');
    }
};

// Метод для добавления тренировки в статистику
userSchema.methods.addWorkoutToStats = function(workoutId, duration = 0, caloriesBurned = 0) {
    this.stats.totalWorkouts += 1;
    this.stats.totalHours += duration / 60; // конвертируем минуты в часы
    
    this.stats.completedWorkouts.push({
        workout: workoutId,
        duration: duration,
        caloriesBurned: caloriesBurned
    });
    
    return this.save();
};

// Метод для добавления веса в историю
userSchema.methods.addWeightRecord = function(weight) {
    this.weightHistory.push({ weight: weight });
    this.profile.weight = weight; // обновляем текущий вес
    
    return this.save();
};

// Метод для получения прогресса по весу
userSchema.methods.getWeightProgress = function(days = 30) {
    if (!this.weightHistory || this.weightHistory.length < 2) return null;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentRecords = this.weightHistory
        .filter(record => record.recordedAt >= cutoffDate)
        .sort((a, b) => a.recordedAt - b.recordedAt);
    
    if (recentRecords.length < 2) return null;
    
    const firstWeight = recentRecords[0].weight;
    const lastWeight = recentRecords[recentRecords.length - 1].weight;
    
    return {
        startWeight: firstWeight,
        currentWeight: lastWeight,
        difference: lastWeight - firstWeight,
        percentChange: ((lastWeight - firstWeight) / firstWeight * 100).toFixed(1)
    };
};

// Метод для добавления достижения
userSchema.methods.addAchievement = function(name, description, icon = null) {
    // Проверяем, что такого достижения еще нет
    const existingAchievement = this.stats.achievements.find(ach => ach.name === name);
    if (existingAchievement) return this;
    
    this.stats.achievements.push({
        name: name,
        description: description,
        icon: icon
    });
    
    return this.save();
};

// Статический метод для поиска пользователей
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
    return this.find({ isActive: true });
};

userSchema.statics.findTrainers = function() {
    return this.find({ role: 'trainer', isActive: true });
};

module.exports = mongoose.model('User', userSchema);