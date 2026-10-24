-- ==========================================================
-- Task Management System - MySQL Database Initialization Script
-- Project: Containerized Task Management System Using Docker & CI/CD
-- ==========================================================

CREATE DATABASE IF NOT EXISTS taskdb;
USE taskdb;

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in-progress', 'completed') NOT NULL DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    due_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Realistic human demonstration tasks
INSERT INTO tasks (title, description, status, priority, due_date) VALUES
    ('Submit Cloud Computing lab record (Unit 3 & 4)', 'Get sign-off from lab assistant and attach screenshot of AWS VPC architecture.', 'pending', 'urgent', DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY)),
    ('Prepare presentation slides for Minor Project viva', 'Include architecture diagram, Docker Compose flow, and CI/CD pipeline steps.', 'in-progress', 'high', DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY)),
    ('Review MySQL indexing and Docker networking questions', 'Prepare answers for viva voce on container communication and volume persistence.', 'pending', 'medium', DATE_ADD(CURRENT_DATE(), INTERVAL 4 DAY)),
    ('Schedule project review with guide Dr. Sharma', 'Discuss EC2 free-tier hosting and demo recording for final evaluation.', 'pending', 'medium', DATE_ADD(CURRENT_DATE(), INTERVAL 5 DAY)),
    ('Buy project file binder and print synopsis draft', 'Print 2 copies of abstract and system requirement specifications.', 'completed', 'low', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)),
    ('Set up GitHub repository and push initial code', 'Initialized git repository with main branch and added .gitignore.', 'completed', 'high', DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY));
