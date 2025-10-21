# Week 5, Day 4: GitHub Actions CI/CD

## 📋 Objectives
- ✅ Set up comprehensive CI/CD pipelines with GitHub Actions
- ✅ Automate testing workflows (unit, integration, E2E)
- ✅ Implement multi-environment deployments
- ✅ Configure secret management and security
- ✅ Set up automated deployment to Firebase
- ✅ Create release automation and versioning

---

## 📚 Key Topics

### 1. Basic CI/CD Pipeline

#### Main Workflow Configuration
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  CACHE_VERSION: 1

jobs:
  test:
    name: Test Suite
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Cache Dependencies
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ env.CACHE_VERSION }}-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-${{ env.CACHE_VERSION }}-

      - name: Install Dependencies
        run: npm ci

      - name: Lint Code
        run: npm run lint

      - name: Type Check
        run: npm run type-check

      - name: Unit Tests
        run: npm run test:ci

      - name: Upload Coverage Reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: test

    services:
      firebase-emulator:
        image: firebase/firebase-tools
        options: --entrypoint firebase

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Application
        run: npm run build

      - name: Start Firebase Emulators
        run: |
          npm install -g firebase-tools
          firebase emulators:start --only auth,firestore,storage &
          sleep 10

      - name: Start Application
        run: |
          npm run start &
          npx wait-on http://localhost:4200

      - name: Run E2E Tests
        run: npm run cypress:run

      - name: Upload E2E Screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots

      - name: Upload E2E Videos
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-videos
          path: cypress/videos

  security-scan:
    name: Security Audit
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install Dependencies
        run: npm ci

      - name: Security Audit
        run: npm audit --audit-level=moderate

      - name: Dependency Review
        uses: actions/dependency-review-action@v3
        if: github.event_name == 'pull_request'
```

### 2. Multi-Environment Deployment

#### Environment-Specific Workflows
```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build for Staging
        run: npm run build:staging
        env:
          NG_APP_FIREBASE_API_KEY: ${{ secrets.STAGING_FIREBASE_API_KEY }}
          NG_APP_FIREBASE_PROJECT_ID: ${{ secrets.STAGING_FIREBASE_PROJECT_ID }}

      - name: Deploy to Firebase Staging
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.STAGING_FIREBASE_SERVICE_ACCOUNT }}'
          projectId: '${{ secrets.STAGING_FIREBASE_PROJECT_ID }}'
          channelId: staging

      - name: Run Smoke Tests
        run: |
          npm run test:smoke -- --baseUrl=https://staging.yourapp.com

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

#### Production Deployment
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  release:
    types: [published]

jobs:
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Full Test Suite
        run: |
          npm run test:ci
          npm run test:e2e:ci

      - name: Build for Production
        run: npm run build:prod
        env:
          NG_APP_FIREBASE_API_KEY: ${{ secrets.PROD_FIREBASE_API_KEY }}
          NG_APP_FIREBASE_PROJECT_ID: ${{ secrets.PROD_FIREBASE_PROJECT_ID }}

      - name: Deploy to Firebase Production
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.PROD_FIREBASE_SERVICE_ACCOUNT }}'
          projectId: '${{ secrets.PROD_FIREBASE_PROJECT_ID }}'

      - name: Update Firestore Security Rules
        run: |
          firebase deploy --only firestore:rules --project ${{ secrets.PROD_FIREBASE_PROJECT_ID }}

      - name: Run Production Health Check
        run: |
          curl -f https://yourapp.com/health || exit 1

      - name: Create Deployment Issue
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `Production Deployment: ${context.payload.release.tag_name}`,
              body: `🚀 Successfully deployed version ${context.payload.release.tag_name} to production.
              
              **Deployment Details:**
              - Release: ${context.payload.release.html_url}
              - Live URL: https://yourapp.com
              - Deployment Time: ${new Date().toISOString()}
              
              **Post-Deployment Checklist:**
              - [ ] Verify critical user flows
              - [ ] Check error monitoring dashboard
              - [ ] Monitor performance metrics
              - [ ] Validate third-party integrations`,
              labels: ['deployment', 'production']
            })
```

### 3. Performance and Lighthouse CI

#### Performance Testing Workflow
```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM

jobs:
  lighthouse-ci:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Application
        run: npm run build

      - name: Serve Application
        run: |
          npm install -g serve
          serve -s dist/app -p 4200 &
          npx wait-on http://localhost:4200

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Bundle Size Analysis
        run: |
          npm run analyze:bundle
          node scripts/bundle-size-check.js

  webpagetest:
    name: WebPageTest
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'
    
    steps:
      - name: Run WebPageTest
        uses: webpagetest/github-action@v1
        with:
          apikey: ${{ secrets.WPT_API_KEY }}
          urls: |
            https://yourapp.com
            https://yourapp.com/about
            https://yourapp.com/services
          budget: performance-budget.json
```

### 4. Release Automation

#### Semantic Release Configuration
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GH_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Tests
        run: npm run test:ci

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release

      - name: Generate Changelog
        run: |
          npx conventional-changelog-cli -p angular -i CHANGELOG.md -s
          git add CHANGELOG.md
          git commit -m "docs: update changelog" || exit 0

      - name: Update Documentation
        run: |
          npm run docs:generate
          npm run docs:deploy
```

### 5. Security and Dependency Management

#### Security Workflow
```yaml
# .github/workflows/security.yml
name: Security Checks

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1' # Weekly on Monday

jobs:
  dependency-review:
    name: Dependency Review
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Dependency Review
        uses: actions/dependency-review-action@v3
        with:
          fail-on-severity: moderate

  codeql-analysis:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        language: ['javascript']
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: ${{ matrix.language }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  snyk-security:
    name: Snyk Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install Dependencies
        run: npm ci

      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Upload Snyk Results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: snyk.sarif
```

### 6. Custom Actions and Reusable Workflows

#### Custom Action for Firebase Deployment
```yaml
# .github/actions/firebase-deploy/action.yml
name: 'Deploy to Firebase'
description: 'Deploy Angular app to Firebase with environment configuration'

inputs:
  firebase-service-account:
    description: 'Firebase service account key'
    required: true
  project-id:
    description: 'Firebase project ID'
    required: true
  environment:
    description: 'Deployment environment'
    required: true
    default: 'production'

outputs:
  deploy-url:
    description: 'Deployed application URL'
    value: ${{ steps.deploy.outputs.details_url }}

runs:
  using: 'composite'
  steps:
    - name: Setup Firebase CLI
      shell: bash
      run: npm install -g firebase-tools

    - name: Configure Firebase
      shell: bash
      run: |
        echo '${{ inputs.firebase-service-account }}' > service-account.json
        firebase use ${{ inputs.project-id }}

    - name: Deploy to Firebase
      id: deploy
      shell: bash
      run: |
        if [ "${{ inputs.environment }}" = "production" ]; then
          firebase deploy --only hosting
        else
          firebase hosting:channel:deploy ${{ inputs.environment }}
        fi

    - name: Cleanup
      shell: bash
      if: always()
      run: rm -f service-account.json
```

#### Reusable Testing Workflow
```yaml
# .github/workflows/reusable-tests.yml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        description: 'Node.js version to use'
        required: false
        default: '18'
        type: string
      environment:
        description: 'Test environment'
        required: false
        default: 'test'
        type: string
    secrets:
      FIREBASE_SERVICE_ACCOUNT:
        required: true
      CYPRESS_RECORD_KEY:
        required: false

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Test Environment
        uses: ./.github/actions/setup-test-env
        with:
          node-version: ${{ inputs.node-version }}
          firebase-service-account: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}

      - name: Run Unit Tests
        run: npm run test:ci

      - name: Run E2E Tests
        run: npm run cypress:run
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
```

---

## 🔨 Hands-On Exercise

### Exercise 1: Complete CI/CD Setup
Set up comprehensive pipelines for all environments.

**Tasks:**
1. Configure main CI/CD workflow
2. Set up staging and production deployments
3. Add security scanning and dependency checks
4. Configure notification systems

### Exercise 2: Performance Monitoring
Implement automated performance testing.

**Tasks:**
1. Set up Lighthouse CI
2. Configure bundle size monitoring
3. Add Core Web Vitals tracking
4. Create performance regression alerts

### Exercise 3: Release Automation
Automate the entire release process.

**Tasks:**
1. Configure semantic release
2. Set up automated changelog generation
3. Add release note automation
4. Configure deployment rollback procedures

---

## ✅ CI/CD Best Practices

### Workflow Organization
- Use reusable workflows for common tasks
- Implement proper secret management
- Set up environment-specific configurations
- Use matrix builds for cross-platform testing

### Security Considerations
- Use least privilege access for tokens
- Regularly rotate secrets and tokens
- Implement dependency vulnerability scanning
- Use signed commits for releases

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase GitHub Integration](https://firebase.google.com/docs/hosting/github-integration)
- [Semantic Release](https://semantic-release.gitbook.io/)

---

## 🎯 Daily Checklist

- [ ] Set up basic CI/CD pipeline with GitHub Actions
- [ ] Configure multi-environment deployments
- [ ] Add automated testing workflows
- [ ] Set up security scanning and dependency checks
- [ ] Configure Firebase deployment automation
- [ ] Implement performance monitoring
- [ ] Set up release automation
- [ ] Add notification systems
- [ ] Test rollback procedures
- [ ] Commit with message: "ci: comprehensive GitHub Actions CI/CD pipeline"

---

**Next**: [Day 5 - Deployment Strategies →](../Day-05-Deployment-Strategies/README.md)

**Previous**: [← Day 3 - E2E Testing with Cypress](../Day-03-E2E-Cypress/README.md)