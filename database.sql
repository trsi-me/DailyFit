-- قاعدة بيانات تطبيق DailyFit
-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS dailyfit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dailyfit;

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    weight DECIMAL(5,2) DEFAULT 0.00,
    height DECIMAL(5,2) DEFAULT 0.00,
    age INT DEFAULT 0,
    daily_calories INT DEFAULT 2000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التمارين
CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_ar VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    description TEXT,
    calories_per_minute INT DEFAULT 0,
    duration_minutes INT DEFAULT 10,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التمارين اليومية (ربط المستخدم بالتمارين حسب اليوم)
CREATE TABLE IF NOT EXISTS daily_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    day_number INT NOT NULL COMMENT '1=الأحد, 2=الإثنين, ... 7=السبت',
    day_name VARCHAR(20) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_day_exercise (user_id, day_number, exercise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدراج بيانات تجريبية للتمارين
INSERT INTO exercises (name_ar, name_en, description, calories_per_minute, duration_minutes) VALUES
('المشي السريع', 'Fast Walking', 'مشي سريع لمدة 30 دقيقة', 5, 30),
('الجري', 'Running', 'جري خفيف لمدة 20 دقيقة', 10, 20),
('تمارين الضغط', 'Push-ups', '3 مجموعات × 10 تكرارات', 3, 15),
('تمارين البطن', 'Abdominal Exercises', '3 مجموعات × 15 تكرار', 4, 20),
('القرفصاء', 'Squats', '3 مجموعات × 12 تكرار', 5, 15),
('اليوجا', 'Yoga', 'جلسة يوجا لمدة 30 دقيقة', 3, 30),
('ركوب الدراجة', 'Cycling', 'ركوب دراجة لمدة 25 دقيقة', 8, 25),
('السباحة', 'Swimming', 'سباحة لمدة 20 دقيقة', 12, 20);

-- إدراج بيانات تجريبية للمستخدم (كلمة المرور: 123456)
-- ملاحظة: في الإنتاج يجب استخدام تشفير كلمات المرور
INSERT INTO users (name, email, password, phone, weight, height, age, daily_calories) VALUES
('مستخدم تجريبي', 'test@example.com', '123456', '0123456789', 75.5, 175.0, 25, 2200);
