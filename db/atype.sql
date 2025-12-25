-- MariaDB-safe schema (avoids reserved words, adds FKs/indexes, re-runnable)

CREATE DATABASE IF NOT EXISTS `atype`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `atype`;

-- Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS `words` (
    
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `word` VARCHAR(150) UNIQUE 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOAD DATA INFILE '/docker-entrypoint-initdb.d/words.txt' 
INTO TABLE words 
LINES TERMINATED BY ' ' 
(word);


-- Typing sessions (renamed `timestamp` -> `session_at`)
CREATE TABLE IF NOT EXISTS `typing_sessions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  -- `text_id` INT UNSIGNED NULL,
  `wpm` INT NOT NULL,
  `accuracy` DECIMAL(5,2) NOT NULL,
  `mode` ENUM('words','time') DEFAULT 'time',
  `amount` ENUM('15','30','60','120') DEFAULT '15',
  `numbers` BOOLEAN DEFAULT FALSE,
  `punctuation` BOOLEAN DEFAULT FALSE,
  `session_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ts_user_id` (`user_id`),
  
  CONSTRAINT `fk_ts_user` FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Leaderboard (one row per user recommended)
CREATE TABLE IF NOT EXISTS `leaderboard` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `highest_wpm` INT NOT NULL,
  `best_accuracy` DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_leaderboard_user_id` (`user_id`),
  KEY `idx_lb_user_id` (`user_id`),
  CONSTRAINT `fk_lb_user` FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
