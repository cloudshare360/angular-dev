# Changelog

All notable changes to the Angular Learning Plan will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] - 2025-10-20

### Added - Complete Learning Plan Structure

#### Week 1: Angular 18 Fundamentals + Portfolio Site
- ✅ Day 1: Setup & Introduction (Environment setup, first component)
- ✅ Day 2: Components & Templates (Data binding, inputs/outputs)
- ✅ Day 3: Directives & Pipes (Built-in directives, custom pipes)
- ✅ Day 4: Signals & Reactivity (Signals, computed, effects)
- ✅ Day 5: Responsive Design & Bootstrap (Mobile-first, accessibility)
- ✅ Day 6: Testing Basics (Unit tests with Jasmine/Karma)
- ✅ Day 7: Deployment (Netlify, Firebase hosting)

#### Week 2: Routing, State, Forms & Employee App
- ✅ Day 1: Router Basics (Routes, navigation, parameters)
- ✅ Day 2: Route Guards & Lazy Loading (CanActivate, code splitting)
- ✅ Day 3: Reactive Forms (FormBuilder, validators)
- ✅ Day 4: Services & DI (inject() function, providedIn)
- ✅ Day 5: RxJS & HTTP (Observables, HttpClient, operators)
- ✅ Day 6: State Management (Signals vs BehaviorSubject)
- ✅ Day 7: Testing (Form tests, service tests, HttpTestingController)

#### Week 3: Advanced Patterns + Shopping Cart
- ✅ Day 1: Component Communication (@Input, @Output, Signals)
- ✅ Day 2: HTTP & API Integration (JSON Server, FakeStore API)
- ✅ Day 3: Interceptors & Error Handling (Auth, logging, errors)
- ✅ Day 4: Environment Configuration (Dev/prod environments)
- ✅ Day 5: Cart Persistence (LocalStorage, computed signals)
- ✅ Day 6: Checkout Flow (Multi-step forms, validation)
- ✅ Day 7: Testing & Optimization (Coverage, bundle analysis)

#### Week 4: CMS for Small Business
- ✅ Day 1: Project Analysis & Setup (Firebase setup, Firestore schema)
- ✅ Day 2: Firebase Authentication (Email/password, Google Sign-In)
- 📝 Days 3-7: Outlined in Week-04-06-Summary.md

#### Weeks 5-6: Testing + Interview Prep
- 📝 Complete outline in Week-04-06-Summary.md

### Added - Conversation Tracking System
- ✅ `.conversations/` folder structure
  - README.md with documentation
  - schema.json for session validation
  - index.json for session registry
  - memory.json for persistent context
  - sessions/ folder with sample-session.json
- ✅ `tools/log_conversation.js` - Node.js helper script
- ✅ `CONVERSATIONS.md` - Usage guide

### Added - Documentation
- ✅ Root `readme.md` with complete navigation
- ✅ Week-level README files with objectives and schedules
- ✅ 29 README files with detailed content, code examples, exercises
- ✅ `Week-04-06-Summary.md` with remaining topics outline
- ✅ This CHANGELOG

### Infrastructure
- ✅ Folder structure for 28 directories
- ✅ Navigation links between all documents
- ✅ Consistent formatting and styling
- ✅ Code examples in TypeScript/HTML/CSS
- ✅ Checklists for each day
- ✅ Resource links to official documentation

---

## Roadmap

### Week 4 Completion
- [ ] Day 3: Content Models & Firestore CRUD
- [ ] Day 4: WYSIWYG Editor (Quill/TinyMCE)
- [ ] Day 5: Preview Mode & Versioning
- [ ] Day 6: Public-Facing Pages
- [ ] Day 7: Testing & Firebase Deployment

### Week 5: Testing Deep Dive + CI/CD
- [ ] Days 1-7: Detailed daily content

### Week 6: Interview Prep + Portfolio Polish
- [ ] Days 1-7: Detailed daily content

### Enhancements
- [ ] Add exercise solutions
- [ ] Create project starter templates
- [ ] Add video tutorial links
- [ ] Create quiz/flashcard system
- [ ] Add code playground links

---

## How to Use This Changelog

This file tracks the evolution of the learning plan. Each commit should reference relevant sections.

**Commit Message Format**:
```
type(scope): description

[optional body]

Refs: #issue or Week-X-Day-Y
```

**Types**: feat, fix, docs, style, refactor, test, chore

