pipeline {
    agent any

    // Automatically runs the suite every Monday at 1:00 PM UTC (13:00)
    triggers {
        cron('0 13 * * 1')
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
                echo 'Installing Node modules and Playwright browsers with system dependencies...'
                bat 'npm ci'
                // Aligned to install all browsers with dependencies for stability
                bat 'npx playwright install --with-deps'
            }
        }

        stage('Run Automation Suites') {
            steps {
                echo 'Executing Playwright specs...'
                bat 'npx playwright test'
            }
        }

        stage('Generate Allure Metrics') {
            steps {
                echo 'Compiling Allure dashboard report...'
                // Standardized to use allure-commandline to match the GitHub flow
                bat 'npx allure-commandline generate allure-results --clean -o allure-report'
            }
        }
    }

    post {
        always {
            echo 'Archiving test failure artifacts...'
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
            
            // Displays interactive Allure graphs inside your Jenkins dashboard card
            allure includeProperties: false, jdk: '', results: [[path: 'allure-results']]
        }
    }
}