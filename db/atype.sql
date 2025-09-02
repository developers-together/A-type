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

-- Optional: texts table if you plan to link sessions to a specific text
-- CREATE TABLE IF NOT EXISTS `texts` (
--   `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
--   `content` TEXT NOT NULL,
--   `language` VARCHAR(20) DEFAULT 'en',
--   `difficulty` ENUM('easy','medium','hard') DEFAULT 'medium',
--   `created_by` INT UNSIGNED NULL,
--   `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY (`id`),
--   KEY `idx_texts_created_by` (`created_by`),
--   CONSTRAINT `fk_texts_user` FOREIGN KEY (`created_by`)
--     REFERENCES `users`(`id`) ON DELETE SET NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Typing sessions (renamed `timestamp` -> `session_at`)
CREATE TABLE IF NOT EXISTS `typing_sessions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `text_id` INT UNSIGNED NULL,
  `wpm` INT NOT NULL,
  `accuracy` DECIMAL(5,2) NOT NULL,
  `session_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  
  CONSTRAINT `user` FOREIGN KEY (`user_id`)
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
