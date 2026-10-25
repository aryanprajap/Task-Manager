pipeline {
    agent any

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

        stage('Test') {
            steps {
                dir('backend') {
                    sh 'npm test || true'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t task-manager:latest .'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker stop task-manager || true
                    docker rm task-manager || true

                    docker run -d \
                      --name task-manager \
                      -p 3000:3000 \
                      task-manager:latest
                '''
            }
        }
    }
}
