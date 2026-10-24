# Containerized Task Management System Using Docker and CI/CD

> **Academic Minor Project &bull; MCA Cloud DevOps Specialization**

A robust, multi-container full-stack web application demonstrating modern **DevOps practices**, **Docker containerization**, **microservice networking**, and an automated **CI/CD pipeline** with GitHub Actions.

---

## 🏗️ Docker Architecture & Multi-Container Design

```text
                             Docker Compose
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
     Frontend Container    Backend Container     MySQL Container
      (Nginx Reverse)      (Node.js + Express)     (MySQL 8.0)
       Port: 80 / 3000          Port: 5000          Port: 3306
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                         Docker Bridge Network
                            (task-network)
```

1. **Frontend Container (`nginx:alpine`)**: Serves the responsive UI assets and acts as a reverse proxy forwarding `/api/` traffic directly to the backend over the internal network.
2. **Backend Container (`node:20-alpine`)**: Implements RESTful CRUD endpoints with Express, connection pooling, and automated health checks.
3. **Database Container (`mysql:8.0`)**: Persists application data in an isolated Docker named volume (`mysql_data`) and initializes schema/seed records from `database/init.sql`.
4. **Docker Bridge Network (`task-network`)**: Provides DNS resolution and secure inter-container communication without exposing internal services to the public internet.

---

## 🔄 DevOps CI/CD Pipeline

```text
Developer Push
      ↓
GitHub Repository (main branch)
      ↓
GitHub Actions Runner
      ↓
Automated Testing (npm test & health checks)
      ↓
Docker Build (multi-stage layer caching)
      ↓
Docker Compose Config Validation
      ↓
Automated Deployment (AWS EC2 / Staging Host)
```

The pipeline configuration is located in [`.github/workflows/ci-cd.yml`](file:///.github/workflows/ci-cd.yml).

---

## 📁 Project Directory Structure

```text
task-manager/
├── .github/
│   └── workflows/
│       └── ci-cd.yml         # GitHub Actions automated pipeline definition
│
├── frontend/
│   ├── index.html            # Semantic UI dashboard & task management modals
│   ├── style.css             # Responsive styling, glassmorphism, dark/light theme
│   └── script.js             # Reactive event handlers, API sync & offline resilience
│
├── backend/
│   ├── server.js             # Express API server & MySQL pool configuration
│   ├── package.json          # Dependencies (express, mysql2, cors, dotenv)
│   ├── routes/
│   │   └── tasks.js          # REST CRUD endpoints with SQL parameterization
│   └── tests/
│       └── health.test.js    # Automated unit & health check tests for CI
│
├── database/
│   └── init.sql              # MySQL DDL schema, indexes, and seed datasets
│
├── nginx.conf                # Nginx reverse proxy configuration
├── Dockerfile                # Multi-stage production container build for backend
├── docker-compose.yml        # Orchestration for Frontend, Backend, and MySQL
├── .dockerignore             # Excluded files for optimized Docker layer builds
├── .gitignore                # Git version control exclusions
└── README.md                 # Complete project guide and viva handbook
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS / Windows / Linux)
- [Git](https://git-scm.com/)

### Step 1: Clone the Repository
```bash
git clone https://github.com/<your-username>/task-manager.git
cd project
```

### Step 2: Launch with Docker Compose
```bash
# Build and start all 3 containers in detached mode
docker compose up --build -d
```

### Step 3: Access the Application
- **Frontend Dashboard**: Open [http://localhost:3000](http://localhost:3000) or [http://localhost](http://localhost)
- **Backend API**: [http://localhost:5001/api/tasks](http://localhost:5001/api/tasks)
- **API Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)
- **MySQL Database**: `localhost:3306` (User: `taskuser`, Password: `taskpassword`, Database: `taskdb`)

### Step 4: Stop Containers
```bash
docker compose down
```
*(To clear database storage volume as well: `docker compose down -v`)*

---

## 🧪 Running CI Tests Locally
```bash
cd backend
npm test
```

---

## 📡 REST API Specifications

| Method | Endpoint | Description | Query Parameters |
|:---|:---|:---|:---|
| `GET` | `/api/tasks` | Fetch tasks list with optional search/filtering | `status`, `priority`, `search` |
| `GET` | `/api/tasks/:id` | Fetch specific task by ID | - |
| `POST` | `/api/tasks` | Create a new task in MySQL | - |
| `PUT` | `/api/tasks/:id` | Update task title, status, priority, or due date | - |
| `DELETE` | `/api/tasks/:id` | Delete task by ID | - |
| `GET` | `/api/health` | Container orchestration health check | - |

---

## 🎓 Viva Voce Preparation Guide (12 Key Questions)

### 1. What is Docker?
> **Answer**: Docker is an open-source containerization platform that packages an application and all its dependencies (code, runtime, libraries, environment variables) into an isolated unit called a container. It ensures software runs consistently across development, testing, and production environments without "it works on my machine" issues.

### 2. What is the difference between a Docker Image and a Docker Container?
> **Answer**: 
> - A **Docker Image** is an immutable, read-only template or blueprint containing the application code, runtime, libraries, and instructions for how to run the app.
> - A **Docker Container** is a running, stateful, isolated instance of a Docker image. You can start, stop, restart, or delete containers.

### 3. Why do we use Docker Compose?
> **Answer**: Docker Compose is a tool for defining and running multi-container Docker applications using a single YAML configuration file (`docker-compose.yml`). Instead of executing manual `docker run` commands for each container, Docker Compose creates, configures, and links networks, volumes, and multiple services (e.g., Frontend + Backend + Database) with a single command: `docker compose up`.

### 4. How do containers communicate with each other?
> **Answer**: Containers communicate over Docker networks using an internal DNS resolver built into the Docker daemon. In our `docker-compose.yml`, services joined to `task-network` communicate using their service names (e.g., `http://backend:5000` or `mysql:3306`) as hostnames, without needing hardcoded IP addresses.

### 5. What are Docker Volumes and why are they needed?
> **Answer**: Containers have ephemeral (temporary) file systems by default; if a container stops or is removed, its data is lost. **Docker Volumes** are managed storage outside the container filesystem on the host machine. In our project, the named volume `mysql_data` persists database records even when the MySQL container restarts or rebuilds.

### 6. What are Docker Networks?
> **Answer**: Docker networks provide isolated network connectivity between containers and between containers and the outside host. We use the **Bridge network** driver (`task-network`), which provides private inter-container DNS discovery and network isolation from external traffic.

### 7. What is a Dockerfile?
> **Answer**: A `Dockerfile` is a text document containing sequential instructions (e.g., `FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, `CMD`) that the Docker engine executes to build a container image automatically.

### 8. What is the role of Git and GitHub in DevOps?
> **Answer**: **Git** is a distributed version control system used to track source code changes and collaborate across branches. **GitHub** is a cloud-based repository hosting platform that acts as the central collaboration hub and triggers automated CI/CD workflows via webhooks whenever code is committed or merged.

### 9. What is CI vs CD?
> **Answer**:
> - **Continuous Integration (CI)**: The automated practice where developers regularly merge code into a shared repository, triggering automated builds and tests (`npm test`) to catch bugs early.
> - **Continuous Delivery / Deployment (CD)**: The automated process where validated code is automatically packaged into artifacts (Docker images) and deployed to staging or production servers (e.g., AWS EC2) with minimal human intervention.

### 10. What are GitHub Actions?
> **Answer**: GitHub Actions is a native CI/CD and automation platform built into GitHub. It executes event-driven workflows defined in YAML files under `.github/workflows/` across virtual runners (Ubuntu, macOS, Windows) to test code, build Docker images, and deploy software.

### 11. Why and how do we use Environment Variables in Docker?
> **Answer**: Environment variables decouple configuration from application source code (following the **12-Factor App** methodology). Sensitive credentials (e.g., `DB_PASSWORD`, `PORT`) are passed into containers at runtime via the `docker-compose.yml` `environment:` block or `.env` files without hardcoding secrets into Git.

### 12. How do you deploy this containerized application to AWS EC2?
> **Answer**:
> 1. Provision an Ubuntu EC2 instance on AWS and configure Security Groups (open ports 80, 22, and 3000).
> 2. Install Docker and Docker Compose on the EC2 instance.
> 3. Clone the Git repository or pull built Docker images from Docker Hub.
> 4. Run `docker compose up -d` to launch the multi-container stack in background mode.
