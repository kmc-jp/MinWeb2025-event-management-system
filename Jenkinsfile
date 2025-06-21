pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build & Test') {
            parallel {
                stage('Backend') {
                    when {
                        changeset "backend/**, docs/api/openapi.yaml"
                    }
                    steps {
                        dir('backend') {
                            sh 'make test'
                            sh 'make build'
                            echo 'Building backend Docker image...'
                        }
                    }
                }
                
                stage('Frontend') {
                    when {
                        changeset "frontend/**, docs/api/openapi.yaml"
                    }
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm run test'
                            sh 'npm run build'
                            echo 'Building frontend Docker image...'
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                anyOf {
                    changeset "backend/**"
                    changeset "frontend/**"
                }
            }
            steps {
                echo 'Deploying to Staging...'
                // ステージング環境へのデプロイステップ
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
} 