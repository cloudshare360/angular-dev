# Week 4: CMS for Small Business (aasoftnet.com Clone)

**Focus**: Authentication + Dynamic Content + Preview & Versioning  
**Duration**: 7 days × 3 hours/day = 21 hours  
**Goal**: Build a content management system with admin auth, WYSIWYG editing, and version control

---

## 📚 Learning Objectives

By the end of this week, you will:
- ✅ Implement Firebase Authentication or JWT-based auth
- ✅ Create role-based access control (admin vs visitor)
- ✅ Build a WYSIWYG content editor
- ✅ Implement preview mode with versioning
- ✅ Store content in Firebase/JSON/local DB
- ✅ Deploy with authentication workflow
- ✅ Write tests for protected routes and auth flows

---

## 📅 Daily Schedule

### Day 1: Project Analysis & Setup
- **Duration**: 3 hours
- **Topics**: Analyze aasoftnet.com, project structure, Firebase setup
- **Deliverable**: Project scaffolded with auth service skeleton

### Day 2: Firebase Authentication
- **Duration**: 3 hours
- **Topics**: Email/password auth, Google auth, auth guards
- **Deliverable**: Login/logout working with protected routes

### Day 3: Content Models & Firebase Database
- **Duration**: 3 hours
- **Topics**: Firestore structure, content CRUD, page models
- **Deliverable**: Content saved to Firebase

### Day 4: WYSIWYG Editor Integration
- **Duration**: 3 hours
- **Topics**: Quill/TinyMCE integration, rich text editing
- **Deliverable**: Admin can edit page content with formatting

### Day 5: Preview Mode & Versioning
- **Duration**: 3 hours
- **Topics**: Draft vs published state, version history, rollback
- **Deliverable**: Preview mode showing beta version

### Day 6: Public-Facing Pages
- **Duration**: 3 hours
- **Topics**: Home, Services, About, Contact pages with dynamic content
- **Deliverable**: Complete website with editable content

### Day 7: Testing & Deployment
- **Duration**: 3 hours
- **Topics**: Auth flow tests, role-based access tests, Firebase deploy
- **Deliverable**: Live CMS deployed with auth

---

## 🎯 Project: Small Business CMS (Inspired by aasoftnet.com)

### Features Analyzed from aasoftnet.com
- **Home Page**: Hero section, services overview, testimonials, CTA
- **Services Page**: Service cards with descriptions
- **About Page**: Company story, team, values
- **Contact Page**: Contact form, location, social links
- **Portfolio**: Project showcases

### CMS Features to Build
- **Admin Login**: Firebase Auth (email/Google)
- **Content Editor**: WYSIWYG editor for each page
- **Preview Mode**: Show "v1.0-beta" banner with draft content
- **Version Control**: Save content versions with timestamps
- **Role-Based Access**: Admin can edit, visitors can only view
- **Responsive**: Mobile-first design
- **Deployment**: Firebase Hosting with auth rules

### Tech Stack
- Angular 18 with standalone components
- Firebase Auth + Firestore
- Quill or TinyMCE for WYSIWYG
- Route guards for protection
- Signals for state management
- Firebase Hosting for deployment

---

## 📖 Resources

- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Quill Editor](https://quilljs.com)
- [TinyMCE](https://www.tiny.cloud)

---

## ✅ Week 4 Checklist

- [ ] Firebase project created and configured
- [ ] Authentication (email + Google) working
- [ ] Admin dashboard with content editor
- [ ] WYSIWYG editor integrated
- [ ] Content saved to Firestore
- [ ] Preview mode with version display
- [ ] Version history and rollback
- [ ] Public pages rendering dynamic content
- [ ] Role-based access working
- [ ] Tests for auth and protected routes
- [ ] Deployed to Firebase Hosting
- [ ] GitHub repo updated

---

**Next Week**: Week 5 - Testing Deep Dive + CI/CD

