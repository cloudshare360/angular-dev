# Day 1: Hands-On Exercises

## Exercise 1: Personal Info Component ⭐

**Objective**: Create a component to display your personal information

**Requirements**:
1. Generate a new component called `personal-info`
2. Add properties for:
   - name (string)
   - role (string)
   - bio (string)
3. Display them in a styled card layout
4. Use TypeScript type annotations

**Expected Output**:
```
┌─────────────────────────────────┐
│  John Doe                        │
│  Senior Angular Developer        │
│                                  │
│  Passionate about building...    │
│  ...                             │
└─────────────────────────────────┘
```

**Starter Code**:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  template: `
    <!-- Your HTML here -->
  `,
  styles: [`
    /* Your CSS here */
  `]
})
export class PersonalInfoComponent {
  // Add properties here
}
```

**Hints**:
- Use CSS Grid or Flexbox for layout
- Add a box-shadow for card effect
- Use padding and margin for spacing

---

## Exercise 2: Skills List Component ⭐⭐

**Objective**: Display a list of technical skills with badges

**Requirements**:
1. Create a `skills` component
2. Define a TypeScript interface for a skill:
   ```typescript
   interface Skill {
     name: string;
     level: 'Beginner' | 'Intermediate' | 'Advanced';
   }
   ```
3. Create an array of at least 5 skills
4. Display each skill with its level
5. Color-code by level (e.g., green = Advanced, yellow = Intermediate)

**Expected Output**:
```
My Skills
─────────
[Advanced]    Angular
[Advanced]    TypeScript
[Intermediate] RxJS
[Beginner]    Testing
```

**Starter Code**:
```typescript
import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="skills-container">
      <h2>My Skills</h2>
      <!-- Loop through skills here -->
    </div>
  `,
  styles: [`
    /* Your CSS here */
  `]
})
export class SkillsComponent {
  skills: Skill[] = [
    // Add your skills here
  ];
}
```

**Hints**:
- Use `*ngFor` to loop through skills array
- Use `[ngClass]` or `[class]` to add conditional classes
- Create CSS classes for each level

---

## Exercise 3: Footer Component ⭐

**Objective**: Create a reusable footer component

**Requirements**:
1. Generate a `footer` component
2. Display:
   - Copyright symbol (©)
   - Current year (dynamically)
   - Your name or brand
   - Social media icons (placeholder links)
3. Center-align the content
4. Add a background color

**Expected Output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2025 My Portfolio. All rights reserved.
[GitHub] [LinkedIn] [Twitter]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Starter Code**:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <!-- Your content here -->
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #333;
      color: white;
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
```

**Hints**:
- Use `{{ currentYear }}` for interpolation
- Social links can be `<a>` tags with `href="#"` for now
- Add margin-top to push footer to bottom

---

## Exercise 4: Composition Challenge ⭐⭐⭐

**Objective**: Combine all components into a complete page

**Requirements**:
1. Update `app.component.ts` to import all components
2. Arrange them in this order:
   - Header (top)
   - Personal Info (center)
   - Skills (center)
   - Footer (bottom)
3. Add consistent spacing between sections
4. Ensure responsive layout (looks good on mobile)

**Expected Structure**:
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
    <!-- Compose all components here -->
  `,
  styles: [`
    /* Global layout styles */
  `]
})
export class AppComponent {}
```

---

## 🎯 Bonus Challenges

### Bonus 1: Add Animations
- Add a fade-in effect when components load
- Use CSS transitions

### Bonus 2: Theme Variables
- Create CSS custom properties for colors
- Define in `styles.css`:
  ```css
  :root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --text-color: #333;
    --bg-color: #f5f5f5;
  }
  ```

### Bonus 3: TypeScript Strict Mode
- Enable strict mode in `tsconfig.json`
- Fix any type errors that appear

---

## ✅ Validation Criteria

### For Each Component:
- [ ] Component generates without errors
- [ ] Component displays correctly in browser
- [ ] TypeScript types are used (no `any`)
- [ ] CSS is scoped to component
- [ ] Code is properly indented and formatted

### For the Complete App:
- [ ] All components render on the page
- [ ] No console errors
- [ ] Responsive on mobile (test at 375px width)
- [ ] Git commit made with meaningful message

---

## 📊 Self-Assessment

Rate your understanding (1-5):
- [ ] Angular CLI usage: ___/5
- [ ] Standalone components: ___/5
- [ ] Component creation: ___/5
- [ ] Template syntax: ___/5
- [ ] TypeScript basics: ___/5

**If any < 3**: Review the relevant section in README.md

---

## 🐛 Common Issues & Solutions

### Issue 1: Component not showing
**Solution**: Check that you imported it in the parent component's `imports` array

### Issue 2: CSS not applying
**Solution**: Ensure styles are in the `styles` array, not `style`

### Issue 3: TypeScript errors
**Solution**: Add proper types to all variables and properties

### Issue 4: Port 4200 already in use
**Solution**: Run `ng serve --port 4201` or kill the process using port 4200

---

**Next**: Day 2 - Components & Templates Deep Dive
