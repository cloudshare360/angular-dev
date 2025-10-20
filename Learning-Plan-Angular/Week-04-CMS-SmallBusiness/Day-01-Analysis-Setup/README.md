````markdown
# Day 1: Project Analysis & Setup

**Duration**: 3 hours  
**Goal**: Analyze aasoftnet.com structure and set up Firebase project.

---

## 🎯 Learning Objectives

- Analyze target website structure and features
- Set up Firebase project and SDK
- Create project structure for CMS
- Plan content models and database schema

---

## 📝 Topics Covered

### 1. Website Analysis (45 minutes)

Visit [www.aasoftnet.com](http://www.aasoftnet.com) and analyze:

#### Pages Identified
- Home: Hero, services overview, testimonials
- Services: Detailed service offerings
- About: Company info, team
- Contact: Form and contact details
- Portfolio: Project showcases

#### Content Types
```typescript
interface PageContent {
  id: string;
  title: string;
  slug: string; // 'home', 'services', 'about', etc.
  sections: Section[];
  metadata: {
    lastModified: Date;
    modifiedBy: string;
    version: string;
    status: 'draft' | 'published';
  };
}

interface Section {
  id: string;
  type: 'hero' | 'text' | 'cards' | 'testimonial' | 'contact-form';
  content: any; // Rich text or structured data
  order: number;
}
```

### 2. Firebase Project Setup (60 minutes)

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: "small-business-cms"
3. Enable Google Analytics (optional)

#### Install Firebase SDK
```bash
npm install firebase @angular/fire
```

#### Initialize Firebase in Angular
```bash
ng add @angular/fire
```

Select:
- ✅ Authentication
- ✅ Cloud Firestore
- ✅ Hosting

#### Firebase Configuration
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  }
};
```

```typescript
// app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};
```

### 3. Project Structure (45 minutes)

```
src/app/
├── core/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.guard.ts
│   │   └── login/
│   ├── services/
│   │   ├── content.service.ts
│   │   └── version.service.ts
│   └── models/
│       ├── page.model.ts
│       └── user.model.ts
├── features/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── content-editor/
│   │   └── version-history/
│   ├── public/
│   │   ├── home/
│   │   ├── services/
│   │   ├── about/
│   │   └── contact/
│   └── shared/
│       ├── components/
│       └── directives/
└── app.routes.ts
```

### 4. Database Schema Design (30 minutes)

#### Firestore Collections

**users**
```json
{
  "uid": "user123",
  "email": "admin@example.com",
  "role": "admin",
  "displayName": "Admin User"
}
```

**pages**
```json
{
  "id": "home",
  "title": "Home Page",
  "slug": "home",
  "currentVersion": "v1.2",
  "publishedContent": {...},
  "draftContent": {...},
  "metadata": {
    "lastModified": "2025-10-20T10:00:00Z",
    "modifiedBy": "admin@example.com",
    "status": "published"
  }
}
```

**versions**
```json
{
  "id": "version123",
  "pageId": "home",
  "version": "v1.1",
  "content": {...},
  "createdAt": "2025-10-15T10:00:00Z",
  "createdBy": "admin@example.com"
}
```

---

## 🏋️ Practice Exercises

1. Create a site map diagram for all pages.
2. Design a content schema for the Services page.
3. Set up Firebase security rules for admin-only write access.

---

## 📚 Resources

- [Firebase Console](https://console.firebase.google.com)
- [AngularFire Documentation](https://github.com/angular/angularfire)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/manage-data/structure-data)

---

## ✅ End of Day Checklist

- [ ] Firebase project created
- [ ] Firebase SDK integrated in Angular
- [ ] Project structure created
- [ ] Database schema designed
- [ ] Firestore collections planned
- [ ] Commit changes

````