# Day 1: Environment Setup & Introduction

**Duration**: 3 hours  
**Goal**: Set up Angular 18 development environment and create your first standalone component

---

## 🎯 Learning Objectives

- Install Node.js, npm, and Angular CLI
- Understand Angular 18 project structure
- Create a standalone component (no NgModule)
- Run the development server
- Make your first code changes

---

## 📝 Topics Covered

### 1. Prerequisites (30 minutes)

#### Install Node.js
```bash
# Check if Node.js is installed
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

#### Install Angular CLI
```bash
# Install Angular CLI globally
npm install -g @angular/cli@18

# Verify installation
ng version
```

### 2. Create Your First Angular 18 App (45 minutes)

#### Generate New Project
```bash
# Create new Angular 18 project with standalone components
ng new my-portfolio --standalone --routing --style=css

# Navigate to project
cd my-portfolio

# Start development server
ng serve
```

Visit: `http://localhost:4200`

#### Project Structure Overview
```
my-portfolio/
├── src/
│   ├── app/
│   │   ├── app.component.ts      # Root standalone component
│   │   ├── app.component.html    # Root template
│   │   ├── app.component.css     # Root styles
│   │   ├── app.component.spec.ts # Root tests
│   │   └── app.config.ts         # App configuration (providers)
│   ├── main.ts                   # Bootstrap entry point
│   ├── index.html                # HTML shell
│   └── styles.css                # Global styles
├── angular.json                  # Angular CLI config
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

### 3. Understanding Standalone Components (60 minutes)

#### What's New in Angular 18?
- **Standalone components** are now the default
- No more `NgModule` boilerplate
- Simpler imports and dependencies
- Better tree-shaking and smaller bundles

#### Anatomy of a Standalone Component
```typescript
// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,           // ← NEW: Makes it standalone
  imports: [RouterOutlet],    // ← Import dependencies here
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'my-portfolio';
}
```

### 4. Hands-On Exercise (45 minutes)

#### Exercise 1: Create a Header Component
```bash
# Generate a new standalone component
ng generate component header --standalone
```

**header.component.ts**:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      text-align: center;
    }
    h1 {
      margin: 0;
      font-size: 2.5rem;
    }
    p {
      margin: 0.5rem 0 0;
      font-size: 1.2rem;
      opacity: 0.9;
    }
  `]
})
export class HeaderComponent {
  title = 'Welcome to My Portfolio';
  subtitle = 'Angular 18 Developer';
}
```

#### Exercise 2: Use the Header Component
Update **app.component.ts**:
```typescript
import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent],  // ← Import your component
  template: `
    <app-header></app-header>
    <main>
      <h2>Hello Angular 18!</h2>
      <p>This is my first standalone component.</p>
    </main>
  `,
  styles: [`
    main {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent {}
```

---

## 🏋️ Practice Exercises

### Exercise 1: Personal Info Component
Create a component that displays:
- Your name
- Your role (e.g., "Frontend Developer")
- A short bio (2-3 sentences)

### Exercise 2: Skills List Component
Create a component that displays a list of your skills:
- Use an array of skills
- Display them in a styled list
- Use TypeScript types

### Exercise 3: Footer Component
Create a footer with:
- Copyright notice
- Current year (use JavaScript `Date`)
- Social media links (placeholders)

---

## 📚 Key Concepts Summary

| Concept | Description |
|---------|-------------|
| **Standalone Components** | Components that don't need NgModule |
| **`@Component` decorator** | Marks a class as an Angular component |
| **selector** | HTML tag to use the component |
| **template/templateUrl** | Component's HTML view |
| **styles/styleUrl** | Component's CSS styles |
| **imports** | Other components/directives this component uses |

---

## ✅ End of Day Checklist

- [ ] Node.js and Angular CLI installed
- [ ] New Angular 18 project created
- [ ] Development server running
- [ ] Header component created and working
- [ ] At least 2 custom components created
- [ ] Understanding of standalone components
- [ ] Code committed to Git

---

## 🔗 Resources

- [Angular CLI Documentation](https://angular.io/cli)
- [Standalone Components Guide](https://angular.dev/guide/components)
- [Angular Component Basics](https://angular.dev/guide/components/basics)

---

## 💡 Tips

1. **Use VS Code**: Install Angular Language Service extension
2. **Hot reload**: Save files and see changes instantly
3. **Check console**: Open browser DevTools for errors
4. **Git commits**: Commit after each exercise

---

**Tomorrow**: Day 2 - Components & Templates Deep Dive
