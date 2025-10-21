# Week 5, Day 3: E2E Testing with Cypress

## 📋 Objectives
- ✅ Master Cypress for end-to-end testing
- ✅ Implement Page Object Model pattern
- ✅ Test critical user journeys
- ✅ Set up visual regression testing
- ✅ Test across different browsers and devices
- ✅ Integrate Cypress with CI/CD pipelines

---

## 📚 Key Topics

### 1. Cypress Setup and Configuration

#### Installation and Basic Setup
```bash
npm install --save-dev cypress @cypress/angular @cypress/schematic
ng add @cypress/schematic
```

#### Cypress Configuration
```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    env: {
      admin_email: 'admin@test.com',
      admin_password: 'testpassword123',
      api_url: 'http://localhost:3000'
    }
  }
});
```

### 2. Page Object Model Implementation

#### Login Page Object
```typescript
// cypress/support/page-objects/login.page.ts
export class LoginPage {
  navigate() {
    cy.visit('/admin/login');
    return this;
  }

  fillEmail(email: string) {
    cy.get('[data-cy=email-input]').type(email);
    return this;
  }

  fillPassword(password: string) {
    cy.get('[data-cy=password-input]').type(password);
    return this;
  }

  submit() {
    cy.get('[data-cy=login-button]').click();
    return this;
  }

  login(email: string, password: string) {
    return this.fillEmail(email).fillPassword(password).submit();
  }

  verifyLoginSuccess() {
    cy.url().should('include', '/admin/dashboard');
    cy.get('[data-cy=user-menu]').should('be.visible');
    return this;
  }

  verifyLoginError(message: string) {
    cy.get('[data-cy=error-message]').should('contain', message);
    return this;
  }
}
```

### 3. Critical User Journey Tests

#### CMS Admin Workflow
```typescript
// cypress/e2e/cms-admin-workflow.cy.ts
import { LoginPage } from '../support/page-objects/login.page';
import { DashboardPage } from '../support/page-objects/dashboard.page';
import { PagesPage } from '../support/page-objects/pages.page';

describe('CMS Admin Workflow', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();
  const pagesPage = new PagesPage();

  beforeEach(() => {
    cy.visit('/');
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should complete full content management workflow', () => {
    // Login
    loginPage
      .navigate()
      .login(Cypress.env('admin_email'), Cypress.env('admin_password'))
      .verifyLoginSuccess();

    // Navigate to pages
    dashboardPage.goToPages();
    
    // Create new page
    pagesPage
      .clickNewPage()
      .fillTitle('Test Page from E2E')
      .fillContent('<h1>E2E Test Content</h1><p>This page was created during automated testing.</p>')
      .fillMetaDescription('Test page for E2E testing')
      .savePage()
      .verifyPageCreated('Test Page from E2E');

    // Edit the page
    pagesPage
      .editPage('Test Page from E2E')
      .updateTitle('Updated E2E Test Page')
      .updateContent('<h1>Updated Content</h1><p>This content was updated by E2E test.</p>')
      .savePage()
      .verifyPageUpdated('Updated E2E Test Page');

    // Publish the page
    pagesPage
      .publishPage('Updated E2E Test Page')
      .verifyPagePublished();

    // Preview the page
    pagesPage
      .previewPage('Updated E2E Test Page');
    
    cy.get('[data-cy=preview-banner]').should('be.visible');
    cy.contains('Updated Content').should('be.visible');

    // Clean up
    cy.go('back');
    pagesPage
      .deletePage('Updated E2E Test Page')
      .confirmDelete()
      .verifyPageDeleted('Updated E2E Test Page');
  });

  it('should handle validation errors', () => {
    loginPage.navigate().login(Cypress.env('admin_email'), Cypress.env('admin_password'));
    dashboardPage.goToPages();
    
    pagesPage
      .clickNewPage()
      .clickSave()
      .verifyValidationErrors(['Title is required', 'Content is required']);
  });
});
```

### 4. Visual Regression Testing

#### Setup Percy for Visual Testing
```bash
npm install --save-dev @percy/cypress
```

```typescript
// cypress/e2e/visual-regression.cy.ts
describe('Visual Regression Tests', () => {
  beforeEach(() => {
    cy.login('admin@test.com', 'password123');
  });

  it('should match dashboard layout', () => {
    cy.visit('/admin/dashboard');
    cy.get('[data-cy=dashboard-content]').should('be.visible');
    cy.percySnapshot('Admin Dashboard');
  });

  it('should match page editor layout', () => {
    cy.visit('/admin/pages/new');
    cy.get('[data-cy=page-editor]').should('be.visible');
    cy.percySnapshot('Page Editor');
  });

  it('should match responsive design', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.percySnapshot('Homepage Mobile');
    
    cy.viewport('macbook-13');
    cy.percySnapshot('Homepage Desktop');
  });
});
```

### 5. Custom Commands

#### Authentication Commands
```typescript
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createTestPage(title: string, content: string): Chainable<void>;
      cleanupTestData(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/admin/login');
    cy.get('[data-cy=email-input]').type(email);
    cy.get('[data-cy=password-input]').type(password);
    cy.get('[data-cy=login-button]').click();
    cy.url().should('include', '/admin/dashboard');
  });
});

Cypress.Commands.add('createTestPage', (title: string, content: string) => {
  cy.visit('/admin/pages/new');
  cy.get('[data-cy=title-input]').type(title);
  cy.get('[data-cy=content-editor]').type(content);
  cy.get('[data-cy=save-button]').click();
  cy.contains(title).should('be.visible');
});

Cypress.Commands.add('cleanupTestData', () => {
  // Clean up any test data created during tests
  cy.visit('/admin/pages');
  cy.get('[data-cy=page-item]').each(($el) => {
    if ($el.text().includes('Test') || $el.text().includes('E2E')) {
      cy.wrap($el).find('[data-cy=delete-button]').click();
      cy.get('[data-cy=confirm-delete]').click();
    }
  });
});
```

### 6. API Testing with Cypress

#### Testing Backend APIs
```typescript
// cypress/e2e/api-tests.cy.ts
describe('API Testing', () => {
  const apiUrl = Cypress.env('api_url');

  it('should authenticate user via API', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: {
        email: 'admin@test.com',
        password: 'password123'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token');
      cy.wrap(response.body.token).as('authToken');
    });
  });

  it('should create and retrieve content via API', () => {
    cy.get('@authToken').then((token) => {
      // Create content
      cy.request({
        method: 'POST',
        url: `${apiUrl}/pages`,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          title: 'API Test Page',
          content: '<p>Created via API</p>',
          status: 'published'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        const pageId = response.body.id;

        // Retrieve content
        cy.request({
          method: 'GET',
          url: `${apiUrl}/pages/${pageId}`
        }).then((getResponse) => {
          expect(getResponse.status).to.eq(200);
          expect(getResponse.body.title).to.eq('API Test Page');
        });
      });
    });
  });
});
```

### 7. Performance Testing

#### Core Web Vitals Testing
```typescript
// cypress/e2e/performance.cy.ts
describe('Performance Tests', () => {
  it('should meet Core Web Vitals thresholds', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        // Measure performance metrics
        win.performance.mark('start');
      }
    });

    cy.window().then((win) => {
      // Largest Contentful Paint
      cy.wrap(win).its('performance').invoke('getEntriesByType', 'largest-contentful-paint')
        .then((entries) => {
          if (entries.length > 0) {
            const lcp = entries[entries.length - 1].startTime;
            expect(lcp).to.be.lessThan(2500); // 2.5s threshold
          }
        });

      // First Input Delay (simulated)
      cy.get('button').first().click().then(() => {
        const fid = win.performance.now();
        expect(fid).to.be.lessThan(100); // 100ms threshold
      });
    });
  });

  it('should load page within acceptable time', () => {
    const start = Date.now();
    cy.visit('/');
    cy.get('[data-cy=main-content]').should('be.visible').then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(3000); // 3 second threshold
    });
  });
});
```

---

## 🔨 Hands-On Exercise

### Exercise 1: E-commerce Testing
Test complete shopping cart workflow.

**Tasks:**
1. Test product browsing and filtering
2. Test adding/removing items from cart
3. Test checkout process with form validation
4. Test order confirmation and email

### Exercise 2: Cross-browser Testing
Set up tests for multiple browsers.

**Tasks:**
1. Configure Cypress for Chrome, Firefox, Edge
2. Test responsive design across viewports
3. Test browser-specific functionality
4. Generate cross-browser test reports

### Exercise 3: Advanced Assertions
Implement complex test scenarios.

**Tasks:**
1. Test file upload functionality
2. Test drag and drop interactions
3. Test date picker and complex forms
4. Test real-time features (WebSocket)

---

## ✅ Testing Best Practices

### Test Organization
- Use Page Object Model for maintainable tests
- Group related tests in describe blocks
- Use data attributes for element selection
- Keep tests independent and isolated

### Test Data Management
- Use fixtures for test data
- Clean up data after tests
- Use unique identifiers for test content
- Mock external services when possible

---

## 📚 Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Percy Visual Testing](https://percy.io/)

---

## 🎯 Daily Checklist

- [ ] Set up Cypress with Angular project
- [ ] Implement Page Object Model pattern
- [ ] Write critical user journey tests
- [ ] Set up visual regression testing
- [ ] Add custom commands for common actions
- [ ] Test API endpoints with Cypress
- [ ] Configure cross-browser testing
- [ ] Set up performance testing
- [ ] Integrate with CI/CD pipeline
- [ ] Commit with message: "test: comprehensive E2E testing with Cypress"

---

**Next**: [Day 4 - GitHub Actions CI/CD →](../Day-04-GitHub-Actions/README.md)

**Previous**: [← Day 2 - Integration Testing](../Day-02-Integration-Testing/README.md)