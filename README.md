# Containerized Task Management System Using Docker Compose & CI/CD

> **Academic Project &bull; Cloud & DevOps Specialization**

A production-grade, multi-container full-stack web application demonstrating advanced **Docker containerization**, **Docker Compose orchestration**, **custom bridge networking**, **persistent named volumes**, **container health checks**, and an automated **Jenkins CI/CD pipeline**.

---

## 🏗️ Docker-Focused Multi-Container Architecture

```text
                         ┌──────────────────────┐
                         │       GitHub         │
                         │   Source Repository  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       Jenkins        │
                         │     CI/CD Pipeline   │
                         └──────────┬───────────┘
                                    │
                       Docker Build / Compose
                                    │
                 ┌──────────────────┴──────────────────┐
                 │       Docker Network                │
                 │       taskmanager-network           │
                 │                                      │
                 │  ┌──────────────┐                    │
                 │  │   Frontend   │                    │
                 │  │ (HTML/CSS/JS)│                    │
                 │  └──────┬───────┘                    │
                 │         │ (Served together)          │
                 │         ▼                            │
                 │  ┌──────────────┐                    │
                 │  │   Backend    │                    │
                 │  │ Node/Express │                    │
                 │  │    :3000     │                    │
                 │  └──────┬───────┘                    │
                 │         │                            │
                 │         │ DB_HOST=mysql              │
                 │         ▼                            │
                 │  ┌──────────────┐                    │
                 │  │    MySQL     │                    │
                 │  │    :3306     │                    │
                 │  └──────┬───────┘                    │
                 │         │                            │
                 │         ▼                            │
                 │  ┌──────────────┐                    │
                 │  │ Docker Volume│                    │
                 │  │  mysql_data  │                    │
                 │  └──────────────┘                    │
                 └──────────────────────────────────────┘
```

---

## 📋 Docker Concepts Implemented

| Docker Concept | Project Implementation |
|---|---|
| **Dockerfile** | Multi-stage, layer-cached image build (`node:20-alpine`) |
| **Docker Compose** | Declarative multi-container management (`docker-compose.yml`) |
| **Docker Network** | Isolated custom bridge network (`taskmanager-network`) |
| **Docker Volumes** | Dedicated persistent volume (`mysql_data`) preventing data loss |
| **Environment Variables** | Decoupled credentials via `.env` (`DB_HOST`, `DB_NAME`, `DB_USER`) |
| **Port Mapping** | Host `:3000` $\rightarrow$ Backend `:3000`, Host `:3306` $\rightarrow$ MySQL `:3306` |
| **Containerization** | Isolated runtimes for Node.js backend and MySQL 8.0 engine |
| **Health Checks** | Automated probing (`mysqladmin ping` and `/api/health`) |
| **Service Discovery** | Internal DNS resolution (`DB_HOST=mysql`) across the Docker network |
| **Restart Policies** | Automated self-healing with `restart: unless-stopped` |
| **Multi-Container Architecture** | Seamless coordination between web layer, API, and database |
| **Jenkins Automation** | End-to-end automated build, test, compose deployment, and verification |

---

## 📁 Project Directory Structure

```text
Task_Manager/
│
├── backend/
│   ├── database/
│   │   ├── db.js             # MySQL connection pool module (with memory fallback)
│   │   └── init.sql          # DDL schema, indexes, and initial seed records
│   ├── routes/
│   │   └── tasks.js          # RESTful CRUD routes with SQL parameterization
│   ├── tests/
│   │   └── health.test.js    # CI/CD test suite for automated validation
│   ├── .env.example          # Sample environment variables for backend
│   ├── package.json          # Express, MySQL2, CORS, dotenv dependencies
│   └── server.js             # Express API server & static frontend host
│
├── frontend/
│   ├── index.html            # Responsive UI dashboard with task filters & stats
│   ├── style.css             # Glassmorphic, responsive modern styling
│   └── script.js             # Reactive DOM handlers, API sync, offline fallback
│
├── Dockerfile                # Production container build with layer caching
├── docker-compose.yml        # Multi-container orchestration (Backend + MySQL)
├── .dockerignore             # Exclusions for optimized Docker build context
├── .env                      # Active runtime environment variables
├── .env.example              # Template environment file
├── Jenkinsfile               # Declarative Jenkins CI/CD pipeline definition
├── package.json              # Root package configuration with compose shortcuts
└── README.md                 # Project documentation and viva handbook
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (optional, for local development outside Docker)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/Task_Manager.git
cd Task_Manager
```

### 2. Configure Environment Variables
```bash
# Copy template environment file if needed (pre-configured by default)
cp .env.example .env
```

### 3. Build & Launch with Docker Compose
```bash
# Build and start all containers in detached mode
docker compose up -d --build
```

### 4. Verify Application Access
* **Frontend Web Application**: [http://localhost:3000](http://localhost:3000)
* **API Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
* **REST API Endpoints**: [http://localhost:3000/api/tasks](http://localhost:3000/api/tasks)
* **MySQL Database**: `localhost:3306` (User: `taskuser`, Password: `taskpass`, Database: `taskmanager`)

---

## 🛠️ Docker Compose Command Reference

| Action | Command | Purpose |
|---|---|---|
| **Build Images** | `docker compose build` | Compiles container images without starting |
| **Start Stack** | `docker compose up -d` | Launches services in background (detached mode) |
| **Rebuild & Start** | `docker compose up -d --build` | Forces image rebuild and starts stack |
| **Check Status** | `docker compose ps` | Displays service status, port mappings, and health |
| **View All Logs** | `docker compose logs` | Streams logs from all running containers |
| **Backend Logs** | `docker compose logs backend` | Inspects Express API and web server logs |
| **MySQL Logs** | `docker compose logs mysql` | Inspects database engine logs |
| **Stop Services** | `docker compose down` | Stops and removes containers and networks (data kept) |
| **Full Clean Reset** | `docker compose down -v` | Stops services AND destroys database volumes |

---

## 🔍 How to Demonstrate Docker in Your Viva / Project Demo

### 1. Demonstrate Service Health & Status
```bash
docker compose ps
```
*Expected Output:* Shows both `task-manager-backend` and `task-manager-mysql` in state `Up (healthy)`.

### 2. Demonstrate Custom Docker Bridge Networking
```bash
# List all active Docker networks
docker network ls

# Inspect the isolated application bridge network
docker network inspect taskmanager_taskmanager-network
```
*Key Point to Highlight*: Point out the `Containers` block in the JSON output showing both `task-manager-backend` and `task-manager-mysql` assigned private IP addresses on the same bridge subnet. Explain that the backend connects to MySQL using the hostname `mysql` via Docker's embedded DNS.

### 3. Demonstrate Docker Persistent Volumes
```bash
# List volumes
docker volume ls

# Inspect the persistent MySQL storage
docker volume inspect taskmanager_mysql_data
```
*Key Point to Highlight*: Show the `Mountpoint` on the host machine. Add a task on the frontend UI, execute `docker compose down`, restart with `docker compose up -d`, and show that the data is preserved because it resides in `mysql_data`.

### 4. Inspect Container Logs in Real Time
```bash
docker compose logs -f backend
```
*Key Point to Highlight*: Perform actions in the web UI (create, filter, edit task) and show real-time HTTP requests and MySQL queries being handled inside the container.

---

## 🔄 DevOps CI/CD Pipeline with Jenkins

```text
GitHub Push
   ↓
Jenkins Webhook Trigger
   ↓
Stage 1: Checkout SCM
   ↓
Stage 2: Install Dependencies (npm install)
   ↓
Stage 3: Automated Testing (npm test / health check)
   ↓
Stage 4: Docker Compose Build (docker compose build)
   ↓
Stage 5: Docker Compose Deploy (docker compose up -d)
   ↓
Stage 6: Docker Verification (ps, network ls, volume ls)
```

The [Jenkinsfile](file:///Users/aryanprajapati/Documents/desktop/Task_Manager/Jenkinsfile) orchestrates the complete lifecycle:
```groovy
stage('Docker Compose Build') {
    steps {
        sh 'docker compose build'
    }
}

stage('Docker Compose Deploy') {
    steps {
        sh 'docker compose down || true'
        sh 'docker compose up -d'
    }
}

stage('Docker Verification') {
    steps {
        sh 'docker compose ps'
        sh 'docker network ls'
        sh 'docker volume ls'
    }
}
```

---

## 📑 Section 5: Docker Containerization (Report Handbook)

Use this complete 15-point section for your project report and documentation:

### 5.1 Docker Architecture
Docker employs a client-server architecture. The **Docker Client** (`docker` CLI) communicates via REST APIs with the **Docker Daemon** (`dockerd`), which builds, runs, and orchestrates containers. Containers are isolated user-space instances sharing the host OS kernel through Linux control groups (`cgroups`) and namespaces.

### 5.2 Dockerfile
The backend image is defined via a declarative `Dockerfile` using `node:20-alpine`. The Dockerfile sets the working directory, copies dependency manifests (`package*.json`), executes clean production installations (`npm install --omit=dev`), transfers source code, exposes port 3000, and specifies the runtime entrypoint.

### 5.3 Docker Image Creation
Docker images are built using read-only stacked layers. By separating `package.json` copying from source code copying, our build utilizes **Docker Layer Caching**: when source code updates without dependency changes, Docker reuses cached dependency layers, reducing build times from minutes to seconds.

### 5.4 Docker Compose
Docker Compose is a declarative orchestration tool configured via `docker-compose.yml`. It coordinates multi-container configurations—defining services, network bindings, storage volumes, health checks, and runtime dependencies in a single version-controlled specification.

### 5.5 Multi-Container Architecture
Rather than running an anti-pattern monolithic container, this project decouples concerns into distinct microservices:
1. **Application/Backend Service**: Express.js REST API + HTML/CSS/JS frontend host.
2. **Database Service**: MySQL 8.0 relational database engine initialized with database schemas.

### 5.6 Docker Networking
Containers communicate over an isolated user-defined bridge network named `taskmanager-network`. Bridge networking provides private communication channels isolated from other Docker containers and external host interfaces.

### 5.7 Service Discovery
Docker's internal DNS resolver automatically maps service names to their container IP addresses. The backend container reaches the database container via `DB_HOST: mysql` instead of hardcoded or fragile IP addresses.

### 5.8 Docker Volumes
Container filesystems are ephemeral: any data written inside a container is deleted when the container is removed. We use a **named Docker volume** (`mysql_data`) mounted to `/var/lib/mysql`. This stores database tables on the host storage engine independently of container lifecycles.

### 5.9 Environment Variables
Following the **12-Factor App methodology**, application configuration is completely decoupled from code. Sensitive credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`) are passed into containers at runtime via `.env` and `docker-compose.yml`, preventing accidental secret leaks in version control.

### 5.10 Health Checks
Docker health checks verify application readiness beyond simple process existence:
* **MySQL**: Executes `mysqladmin ping -h localhost` every 10 seconds.
* **Backend**: Employs `depends_on: { mysql: { condition: service_healthy } }`, ensuring the API server does not start until MySQL is fully initialized and accepting connections.
* **API Health**: Probes `wget http://localhost:3000/api/health` to monitor route responsiveness.

### 5.11 Port Mapping
Port mapping (`HOST_PORT:CONTAINER_PORT`) bridges host interfaces to private container ports:
* `3000:3000` maps host port 3000 to the containerized Express application.
* `3306:3306` enables developer database access and inspection tools from the host.

### 5.12 Container Lifecycle Management
Docker Compose manages full container state transitions: creation (`up`), execution (`start`), status polling (`ps`), inspection (`logs`), graceful termination (`down`), and teardown (`down -v`). `restart: unless-stopped` ensures containers automatically recover from unexpected crashes or host restarts.

### 5.13 Jenkins + Docker Integration
Jenkins acts as the automated CI/CD controller. The pipeline script executes automated dependency checks and tests, invokes `docker compose build`, deploys the multi-container stack with `docker compose up -d`, and audits runtime health through automated verification commands.

### 5.14 Docker Troubleshooting
Common container troubleshooting techniques demonstrated in the project:
* Inspecting container logs: `docker compose logs -f <service>`
* Accessing an interactive container shell: `docker exec -it task-manager-backend sh`
* Querying database inside container: `docker exec -it task-manager-mysql mysql -u taskuser -ptaskpass taskmanager`
* Diagnosing DNS resolution: `docker exec -it task-manager-backend ping mysql`

### 5.15 Deployment Verification
Deployment health is verified using three automated checks:
1. Container status: `docker compose ps` (verifying `Up (healthy)`)
2. Network integrity: `docker network inspect taskmanager_taskmanager-network` (verifying connected container endpoints)
3. Volume persistence: `docker volume inspect taskmanager_mysql_data` (verifying host mount points)

---

## 📡 REST API Specifications

| Method | Endpoint | Description | Query Parameters |
|:---|:---|:---|:---|
| `GET` | `/api/health` | Container orchestration health check | - |
| `GET` | `/api/tasks` | Fetch tasks list with optional search/filtering | `status`, `priority`, `search` |
| `GET` | `/api/tasks/:id` | Fetch specific task by ID | - |
| `POST` | `/api/tasks` | Create a new task in MySQL | - |
| `PUT` | `/api/tasks/:id` | Update task title, status, priority, or due date | - |
| `DELETE` | `/api/tasks/:id` | Delete task by ID | - |

---

## 🎓 Viva Voce Preparation Guide (12 Key Questions & Answers)

### 1. How would you summarize your project in one sentence?
> **Answer**: "I containerized a full-stack Task Management application using Docker and implemented a multi-container architecture using Docker Compose, custom bridge networking, persistent named volumes, automated container health checks, environment variable decoupling, and Jenkins CI/CD pipeline automation."

### 2. Why did you use Docker Compose instead of standalone `docker run` commands?
> **Answer**: `docker run` requires running individual, manual commands with multiple command-line arguments for ports, networks, and volumes for each container. Docker Compose uses a single declarative YAML file (`docker-compose.yml`) to define, start, link, and manage multi-container services with a single command: `docker compose up -d`.

### 3. How do the Backend and MySQL containers communicate without knowing each other's IP addresses?
> **Answer**: Both containers join a user-defined bridge network called `taskmanager-network`. Docker provides an embedded DNS server that automatically resolves container and service names to their container IP addresses. The backend reaches the database using the service name `mysql` (`DB_HOST=mysql`), eliminating hardcoded IP addresses.

### 4. What happens to database data when the MySQL container is stopped or recreated?
> **Answer**: Database data is preserved because it is stored in a dedicated named Docker volume (`mysql_data`) mounted to `/var/lib/mysql`. Docker volumes exist outside the ephemeral container filesystem on the host machine, decoupling data persistence from container lifecycles.

### 5. How does the backend avoid crashing if MySQL takes longer to boot up?
> **Answer**: We implemented two safeguards:
> 1. In `docker-compose.yml`, MySQL has a `healthcheck` (`mysqladmin ping`) and the backend uses `depends_on: { mysql: { condition: service_healthy } }`, so the backend waits until MySQL is fully ready.
> 2. In Node.js, `backend/database/db.js` implements a connection pool with an automatic zero-downtime in-memory fallback if the database is temporarily unreachable.

### 6. What is the difference between a Docker Image and a Docker Container?
> **Answer**: A **Docker Image** is an immutable, read-only template built from instructions in a Dockerfile. A **Docker Container** is a runnable, isolated, stateful instance created from that image.

### 7. Why did you use `node:20-alpine` as the base image?
> **Answer**: Alpine Linux is an ultra-minimal distribution designed for security and speed. It produces an image of ~180MB compared to standard Debian-based Node images which often exceed 1GB, resulting in faster pulls, reduced disk usage, and a smaller attack surface.

### 8. How does Docker layer caching work in your Dockerfile?
> **Answer**: Docker executes Dockerfiles instruction by instruction, caching the result of each layer. In our Dockerfile, `package*.json` is copied and `npm install` is executed before copying application source code. If only source code changes, Docker reuses the cached `npm install` layer, accelerating build times.

### 9. What is the purpose of `.dockerignore`?
> **Answer**: `.dockerignore` excludes unnecessary files (such as local `node_modules`, `.git`, `.env`, temporary logs) from the Docker build context. This minimizes image size, speeds up build times, and prevents committing sensitive local credentials into images.

### 10. How does Jenkins interact with Docker in this project?
> **Answer**: Jenkins acts as the CI/CD automation engine. In `Jenkinsfile`, it checks out the code, installs dependencies, runs automated tests (`npm test`), builds the multi-container images with `docker compose build`, deploys them with `docker compose up -d`, and verifies running services using `docker compose ps`.

### 11. How do you inspect a running Docker container for debugging?
> **Answer**:
> - View logs: `docker compose logs -f <service>`
> - Open shell inside container: `docker exec -it <container_name> sh`
> - Inspect network connectivity: `docker network inspect <network_name>`
> - Check resource usage: `docker stats`

### 12. How would you deploy this containerized stack to AWS EC2?
> **Answer**:
> 1. Launch an Ubuntu EC2 instance on AWS and configure Security Groups to open ports 80, 22, 3000, and 8080 (for Jenkins).
> 2. Install Docker and Docker Compose on the EC2 instance.
> 3. Pull the code repository or pull pre-built images from Docker Hub.
> 4. Execute `docker compose up -d` to bring up the full multi-container application in background mode.
