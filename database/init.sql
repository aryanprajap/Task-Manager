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

-- Seed initial demonstration data
INSERT INTO tasks (title, description, status, priority, due_date) VALUES
    ('Set up Git Repository & Branching Strategy', 'Initialize Git repo with main and feature branches for team workflow.', 'completed', 'high', DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY)),
    ('Build Responsive Web Interface', 'Develop mobile-friendly HTML/CSS/JS frontend with live status dashboard.', 'completed', 'medium', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)),
    ('Develop Node.js & Express REST API', 'Implement CRUD routes with MySQL connection pooling and error handling.', 'in-progress', 'high', DATE_ADD(CURRENT_DATE(), INTERVAL 2 DAY)),
    ('Dockerize Multi-Container Architecture', 'Configure Dockerfile and docker-compose.yml for Frontend, Backend, and MySQL.', 'in-progress', 'urgent', DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY)),
    ('Implement GitHub Actions CI/CD Pipeline', 'Automate testing, Docker image building, and pushing to Docker Hub.', 'pending', 'high', DATE_ADD(CURRENT_DATE(), INTERVAL 5 DAY)),
    ('Deploy to Cloud Server & Prepare Viva', 'Deploy containerized stack onto AWS EC2 or local Docker host.', 'pending', 'medium', DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY));
