pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "crm-frontend:v1"
        BACKEND_IMAGE  = "crm-backend:v1"
    }

    stages {

        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('Verify Tools') {
            steps {
                bat 'git --version'
                bat 'docker --version'
                bat 'node -v'
                bat 'npm -v'
                bat 'php -v'
                bat 'composer -V'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    bat 'docker build -t %FRONTEND_IMAGE% .'
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    bat 'docker build -t %BACKEND_IMAGE% .'
                }
            }
        }

        stage('Show Docker Images') {
            steps {
                bat 'docker images'
            }
        }
    }

    post {
        success {
            echo '✅ Build Successful'
        }

        failure {
            echo '❌ Build Failed'
        }

        always {
            echo 'Pipeline Finished'
        }
    }
}