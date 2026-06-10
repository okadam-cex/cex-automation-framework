pipeline {
    agent any

    // This schedules your test framework to run automatically every Monday morning at 6:00 AM
    triggers {
        cron('0 6 * * 1')
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Pull Codebase') {
            steps {
                // Pulls the latest code directly from your GitHub repo
                checkout scm
            }
        }

        stage('Install Packages') {
            steps {
                echo 'Installing Node modules and Playwright browsers...'
                bat 'npm ci'
                bat 'npx playwright install chromium'
            }
        }

        stage('Run Automation Suites') {
            steps {
                echo 'Executing Playwright specs...'
                // Adjust this line if your script name or command is different in package.json
                bat 'npx playwright test'
            }
        }

        stage('Generate Allure Metrics') {
            steps {
                echo 'Compiling Allure dashboard report...'
                bat 'npx allure generate allure-results --clean -o allure-report'
            }
        }
    }

    post {
        always {
            echo 'Archiving test failure artifacts...'
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
            
            // This displays your interactive Allure graphs inside your Jenkins dashboard card
            allure includeProperties: false, jdk: '', results: [[path: 'allure-results']]
        }
    }
}