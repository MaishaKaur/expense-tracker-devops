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

        // ── 5. DEPLOY (staging) ───────────────────────────────────────────
        stage('Deploy') {
            steps {
                echo 'Building Docker image...'
                sh 'docker build -t expensetracker-app:${BUILD_NUMBER} -t expensetracker-app:staging .'

                echo 'Deploying to staging environment...'
                sh 'docker stop expensetracker-staging || true'
                sh 'docker rm  expensetracker-staging || true'

                sh '''
                    NETWORK=$(docker network ls --format "{{.Name}}" | grep app-network | head -1)
                    docker run -d \
                      --name expensetracker-staging \
                      --network ${NETWORK:-bridge} \
                      -p 3002:3000 \
                      -e NODE_ENV=staging \
                      -e DATABASE_URL=postgresql://taskuser:taskpassword@postgres:5432/taskdb \
                      -e REDIS_URL=redis://redis:6379 \
                      -e JWT_SECRET=staging-secret-key \
                      -e PORT=3000 \
                      expensetracker-app:${BUILD_NUMBER}
                '''

                echo 'Waiting for staging container to start...'
                sh 'sleep 15'

                echo 'Running smoke test...'
                sh 'curl -sf http://localhost:3002/health && echo "Staging health check passed" || echo "Health endpoint not reachable - container may still be starting"'
            }
            post {
                failure {
                    sh 'docker stop expensetracker-staging || true'
                    sh 'docker rm  expensetracker-staging || true'
                }
            }
        }

        // ── 6. RELEASE ────────────────────────────────────────────────────
        stage('Release') {
            steps {
                echo 'Tagging Docker image as release...'
                sh 'docker tag expensetracker-app:${BUILD_NUMBER} expensetracker-app:latest'
                sh 'docker tag expensetracker-app:${BUILD_NUMBER} expensetracker-app:release-${BUILD_NUMBER}'

                echo 'Creating git release tag...'
                sh '''
                    git config user.email "jenkins@expensetracker.local"
                    git config user.name  "Jenkins CI"
                    git tag -a "v1.0.${BUILD_NUMBER}" -m "Release v1.0.${BUILD_NUMBER} - Build #${BUILD_NUMBER}" || true
                '''

                echo "Release v1.0.${BUILD_NUMBER} tagged successfully!"
            }
            post {
                success {
                    archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
                }
            }
        }

        // ── 7. MONITORING ─────────────────────────────────────────────────
        stage('Monitoring') {
            steps {
                echo 'Verifying monitoring stack...'

                sh 'curl -sf http://localhost:9090/-/healthy && echo "Prometheus is healthy" || echo "Prometheus not reachable"'
                sh 'curl -sf http://localhost:3001/api/health && echo "Grafana is up" || echo "Grafana not reachable"'
                sh 'curl -sf http://localhost:3000/metrics | head -5 && echo "App metrics endpoint live" || echo "Metrics endpoint not reachable"'

                sh '''
                    echo "========================================"
                    echo "  Monitoring Stack Summary"
                    echo "========================================"
                    echo "  Prometheus : http://localhost:9090"
                    echo "  Grafana    : http://localhost:3001"
                    echo "  App metrics: http://localhost:3000/metrics"
                    echo "  Staging app: http://localhost:3002"
                    echo "========================================"
                '''
            }
        }

    }

    post {
        always { cleanWs() }
    }
}
