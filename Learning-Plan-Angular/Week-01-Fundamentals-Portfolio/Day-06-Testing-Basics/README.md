````markdown
# Day 6: Testing Basics

**Duration**: 3 hours  
**Goal**: Write unit tests for components and services using Jasmine and Karma (or Vitest where configured).

---

## 🎯 Learning Objectives
- Configure and run unit tests in an Angular project
- Test standalone components with `TestBed` and `ComponentFixture`
- Mock services and HTTP calls in unit tests

---

## 📝 Topics Covered

### 1. Testing Setup (30 minutes)
- `ng test` (Karma/Jasmine) or Vitest setup if the project uses it
- Test file structure and naming conventions

### 2. Component Tests (60 minutes)
- Create component fixture and detect changes
- Query DOM elements and assert content
- Test inputs & outputs and event emission

### 3. Service Tests & HttpClient (30 minutes)
- Use `HttpClientTestingModule` and `HttpTestingController`
- Mock API responses and test error handling

### 4. Coverage & Best Practices (20 minutes)
- Aim for meaningful coverage (not 100% for trivial files)
- Keep tests fast and deterministic

### 5. Hands-On Tasks (40 minutes)
- Write 3 unit tests: header component, project card, and a small service (e.g., ProjectService)
- Run tests and generate coverage report

---

## 🏋️ Practice Exercises
1. Write a test that asserts the dark mode toggle updates the DOM class.
2. Mock an HTTP call in `ProjectService` and assert service behaviour on success and failure.
3. Add a test for a pipe and a directive created earlier.

---

## 📚 Resources
- Testing Guide: https://angular.dev/guide/testing
- HttpClient testing: https://angular.io/api/common/http/testing/HttpTestingController

---

## ✅ End of Day Checklist
- [ ] At least 3 unit tests written and passing
- [ ] Coverage report generated locally
- [ ] Tests added to CI later in Week 5
- [ ] Commit test changes

````