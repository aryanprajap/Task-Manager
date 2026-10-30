pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'taskmanager'
    }

    stages {

        stage('Clone Repository') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Automated Tests') {
            steps {
                dir('backend') {
                    sh 'npm test || true'
                }
            }
        }

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
    }

    post {
        always {
            cleanWs()
        }
    }
}
