pipeline {
    agent any

    environment {
        DOCKER_HUB = "singhsarvesh"

        IMAGE_TAG = "${BUILD_NUMBER}"

        FRONTEND_IMAGE = "${DOCKER_HUB}/crm-frontend:${IMAGE_TAG}"
        BACKEND_IMAGE  = "${DOCKER_HUB}/crm-backend:${IMAGE_TAG}"
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
                    bat "docker build -t %FRONTEND_IMAGE% ."
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    bat "docker build -t %BACKEND_IMAGE% ."
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {

                    writeFile file: 'docker-pass.txt', text: env.DOCKER_PASS

                    bat '''
                    type docker-pass.txt | docker login -u %DOCKER_USER% --password-stdin
                    '''

                    bat 'del docker-pass.txt'
                }
            }
        }

        stage('Push Frontend Image') {
            steps {
                bat "docker push %FRONTEND_IMAGE%"
            }
        }

        stage('Push Backend Image') {
            steps {
                bat "docker push %BACKEND_IMAGE%"
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
            echo "=============================================="
            echo " BUILD SUCCESSFUL "
            echo "=============================================="
            echo "Frontend Image : ${FRONTEND_IMAGE}"
            echo "Backend Image  : ${BACKEND_IMAGE}"
            echo "Images Successfully Pushed To Docker Hub"
            echo "=============================================="
        }

        failure {
            echo "=============================================="
            echo " BUILD FAILED "
            echo "Check Console Output"
            echo "=============================================="
        }

        always {
            bat 'docker logout'
            cleanWs()
            echo "Pipeline Finished"
        }
    }
}
