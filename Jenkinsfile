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
        sh 'npm install'
        sh 'npm run build'
    }
    post {
        success {
            archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
        }
    }
}

        stage('Test') {
    steps {
        echo 'Running unit tests...'
        sh 'npm test -- --testPathPattern=unit --ci --reporters=default --reporters=jest-junit'
    }
    post {
        always {
            junit allowEmptyResults: true, testResults: 'junit.xml'
        }
    }
}

        stage('Code Quality') {
    steps {
        echo 'Running ESLint...'
        sh 'npm run lint || true'
        script {
            def scannerHome = tool 'SonarQube Scanner'
            withSonarQubeEnv('SonarQube') {
                sh "${scannerHome}/bin/sonar-scanner"
            }
        }
    }
}

        stage('Security') {
    steps {
        echo 'Running security audit...'
        sh 'npm audit --audit-level=high || true'
        sh '''
            if command -v trivy &> /dev/null; then
                trivy fs --severity HIGH,CRITICAL --exit-code 0 .
            else
                echo "Trivy not installed - skipping filesystem scan"
            fi
        '''
    }
    post {
        always {
            archiveArtifacts artifacts: 'npm-audit.json', allowEmptyArchive: true
        }
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
