# Day 1: Code Solutions

## Exercise 1 Solution: Personal Info Component

### personal-info.component.ts
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  template: `
    <div class="card">
      <h2 class="name">{{ name }}</h2>
      <p class="role">{{ role }}</p>
      <p class="bio">{{ bio }}</p>
    </div>
  `,
  styles: [`
    .card {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .name {
      margin: 0 0 0.5rem;
      color: #667eea;
      font-size: 2rem;
    }
    
    .role {
      margin: 0 0 1rem;
      color: #764ba2;
      font-size: 1.2rem;
      font-weight: 500;
    }
    
    .bio {
      margin: 0;
      line-height: 1.6;
      color: #555;
    }
  `]
})
export class PersonalInfoComponent {
  name: string = 'John Doe';
  role: string = 'Senior Angular Developer';
  bio: string = 'Passionate about building scalable web applications with modern frameworks. Specializing in Angular, TypeScript, and cloud technologies with 5+ years of experience.';
}
```

### How to Generate:
```bash
ng generate component personal-info --standalone
```

---

## Exercise 2 Solution: Skills List Component

### skills.component.ts
```typescript
import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';

interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <div class="skills-container">
      <h2>My Skills</h2>
      <div class="skills-grid">
        <div *ngFor="let skill of skills" class="skill-item">
          <span class="skill-name">{{ skill.name }}</span>
          <span class="skill-level" [ngClass]="getLevelClass(skill.level)">
            {{ skill.level }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skills-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
    }
    
    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
    }
    
    .skills-grid {
      display: grid;
      gap: 1rem;
    }
    
    .skill-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: white;
      border-radius: 6px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
    
    .skill-name {
      font-weight: 500;
      color: #333;
    }
    
    .skill-level {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    
    .level-advanced {
      background: #10b981;
      color: white;
    }
    
    .level-intermediate {
      background: #f59e0b;
      color: white;
    }
    
    .level-beginner {
      background: #3b82f6;
      color: white;
    }
  `]
})
export class SkillsComponent {
  skills: Skill[] = [
    { name: 'Angular', level: 'Advanced' },
    { name: 'TypeScript', level: 'Advanced' },
    { name: 'RxJS', level: 'Intermediate' },
    { name: 'Testing (Jasmine/Karma)', level: 'Intermediate' },
    { name: 'NgRx/State Management', level: 'Beginner' },
    { name: 'HTML5 & CSS3', level: 'Advanced' },
    { name: 'RESTful APIs', level: 'Advanced' },
    { name: 'Git & GitHub', level: 'Advanced' }
  ];

  getLevelClass(level: string): string {
    return `level-${level.toLowerCase()}`;
  }
}
```

### How to Generate:
```bash
ng generate component skills --standalone
```

---

## Exercise 3 Solution: Footer Component

### footer.component.ts
```typescript
import { Component } from '@angular/core';

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p class="copyright">
          &copy; {{ currentYear }} {{ brandName }}. All rights reserved.
        </p>
        <div class="social-links">
          <a *ngFor="let link of socialLinks" 
             [href]="link.url" 
             target="_blank"
             rel="noopener noreferrer"
             class="social-link">
            {{ link.icon }} {{ link.name }}
          </a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #1f2937;
      color: #e5e7eb;
      margin-top: auto;
    }
    
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
    
    .copyright {
      margin: 0 0 1rem;
      font-size: 0.9rem;
    }
    
    .social-links {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    
    .social-link {
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.3s ease;
      font-size: 0.9rem;
    }
    
    .social-link:hover {
      color: #667eea;
    }
  `]
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  brandName: string = 'My Portfolio';
  
  socialLinks: SocialLink[] = [
    { name: 'GitHub', url: 'https://github.com/yourusername', icon: '🔗' },
    { name: 'LinkedIn', url: 'https://linkedin.com/in/yourusername', icon: '💼' },
    { name: 'Twitter', url: 'https://twitter.com/yourusername', icon: '🐦' }
  ];
}
```

**Note**: You'll need to add `NgFor` to imports if using `*ngFor`:
```typescript
import { NgFor } from '@angular/common';

// In @Component decorator:
imports: [NgFor]
```

### How to Generate:
```bash
ng generate component footer --standalone
```

---

## Exercise 4 Solution: Complete App Composition

### app.component.ts
```typescript
import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { SkillsComponent } from './skills/skills.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    PersonalInfoComponent,
    SkillsComponent,
    FooterComponent
  ],
  template: `
    <div class="app-container">
      <app-header></app-header>
      
      <main class="main-content">
        <app-personal-info></app-personal-info>
        <app-skills></app-skills>
      </main>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #f9fafb;
    }
    
    .main-content {
      flex: 1;
      padding: 2rem 1rem;
    }
    
    @media (max-width: 768px) {
      .main-content {
        padding: 1rem 0.5rem;
      }
    }
  `]
})
export class AppComponent {}
```

### styles.css (Global Styles)
```css
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
  color: #333;
  background-color: #f9fafb;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.2;
}

/* Responsive Images */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Links */
a {
  color: #667eea;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
```

---

## Bonus Solutions

### Bonus 1: Add Fade-In Animation

Add to any component's styles:
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animated-component {
  animation: fadeIn 0.6s ease-out;
}
```

### Bonus 2: Theme Variables

Update `styles.css`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --info-color: #3b82f6;
  --text-color: #333;
  --text-light: #6b7280;
  --bg-color: #f9fafb;
  --card-bg: #ffffff;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);
  --border-radius: 8px;
}

/* Then use them in components */
.card {
  background: var(--card-bg);
  box-shadow: var(--shadow);
  border-radius: var(--border-radius);
}
```

### Bonus 3: Enable TypeScript Strict Mode

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true
  }
}
```

---

## 🧪 Testing Your Solutions

### Run the Development Server
```bash
ng serve
```

### Check for Errors
```bash
ng build
```

### Verify TypeScript
```bash
npx tsc --noEmit
```

---

## 📝 Code Quality Checklist

- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] All components display correctly
- [ ] Responsive on mobile (test at 375px)
- [ ] Proper indentation (use Prettier)
- [ ] Meaningful variable names
- [ ] Components are reusable
- [ ] Styles are scoped to components

---

**Congratulations!** You've completed Day 1. Commit your code:
```bash
git add .
git commit -m "feat: complete Day 1 - Setup and Introduction"
```

**Tomorrow**: Day 2 - Components & Templates Deep Dive
