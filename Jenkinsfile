pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'expensetracker'
        DOCKER_TAG   = "${env.BUILD_NUMBER}"
        APP_NAME     = 'expensetracker'
        SONAR_SERVER = 'SonarQube'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {

        stage('Build') {
    steps {
        echo 'Installing dependencies and building...'
        sh '''
            docker run --rm \
              -v $(pwd):/app \
              -w /app \
              node:20-alpine \
              sh -c "npm install && npm run build"
        '''
    }
    post {
        success {
            archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
        }
    }
}

        stage('Test') {
            steps {
                echo 'Test stage – implement me'
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Code Quality stage – implement me'
            }
        }

        stage('Security') {
            steps {
                echo 'Security stage – implement me'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploy stage – implement me'
            }
        }

        stage('Release') {
            steps {
                echo 'Release stage – implement me'
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Monitoring stage – implement me'
            }
        }

    }

    post {
        always { cleanWs() }
    }
}
