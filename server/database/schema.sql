CREATE DATABASE IF NOT EXISTS fitness_app;
USE fitness_app;

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20)
);

CREATE TABLE Trainers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    description TEXT
);

CREATE TABLE MuscleGroups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE Exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    muscle_group_id INT,
    gif_url VARCHAR(255),
    FOREIGN KEY (muscle_group_id) REFERENCES MuscleGroups(id)
);

CREATE TABLE Trainings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT,
    title VARCHAR(100) NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    capacity INT,
    FOREIGN KEY (trainer_id) REFERENCES Trainers(id)
);

CREATE TABLE Bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    training_id INT,
    date DATE,
    status ENUM('booked', 'cancelled', 'attended') DEFAULT 'booked',
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (training_id) REFERENCES Trainings(id)
);
