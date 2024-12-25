CREATE DATABASE excel_sheet;
USE excel_sheet;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE typing_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wpm INT NOT NULL,
    accuracy DECIMAL(5, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE texts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL
);

CREATE TABLE leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    highest_wpm INT NOT NULL,
    best_accuracy DECIMAL(5, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
