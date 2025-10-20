# Quick Reference Card

**Keep this handy while learning!** 📌

---

## 🚀 Daily Workflow

```bash
# 1. Navigate to learning plan
cd /workspaces/angular-dev/Learning-Plan-Angular

# 2. Open today's guide (example: Week 1, Day 1)
code Week-01-Fundamentals-Portfolio/Day-01-Setup-Introduction/README.md

# 3. Follow the exercises

# 4. When done, commit your work
cd /workspaces/angular-dev
./tools/checkpoint.sh 1 1 completed
```

---

## 📝 Essential Commands

### Git Operations
```bash
# Quick commit
./tools/auto-commit.sh "message"

# Mark day complete
./tools/checkpoint.sh <week> <day> <status>

# Manual commit
git add .
git commit -m "feat: completed exercise"
git push origin main
```

### Conversation Logging
```bash
# Log progress
node tools/log_conversation.js \
  --sessionId "week1-$(date +%Y%m%d)" \
  --role user \
  --content "Your message"
```

### Angular CLI
```bash
# New project
ng new my-app --standalone --routing --style=css

# Generate component
ng generate component header --standalone

# Serve app
ng serve

# Build for production
ng build --configuration production

# Run tests
ng test

# Generate coverage
ng test --code-coverage
```

---

## 📂 File Locations

| What | Where |
|------|-------|
| Learning materials | `Learning-Plan-Angular/Week-XX/Day-XX/` |
| Progress tracker | `Learning-Plan-Angular/PROGRESS.md` |
| Changelog | `CHANGELOG.md` |
| Conversation logs | `.conversations/sessions/` |
| Helper tools | `tools/` |

---

## 🎯 Week-by-Week Projects

| Week | Project | Tech Focus |
|------|---------|-----------|
| 1 | Portfolio Website | Components, Signals, Testing |
| 2 | Employee Management | Routing, Forms, State |
| 3 | Shopping Cart | HTTP, Interceptors, Persistence |
| 4 | Business CMS | Firebase Auth, Firestore, Versioning |
| 5 | Testing & CI/CD | Unit/E2E tests, GitHub Actions |
| 6 | Interview Prep | Questions, System Design, Portfolio |

---

## 🔑 Key Concepts

### Standalone Components (Angular 18)
```typescript
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `<h1>Hello</h1>`
})
```

### Signals
```typescript
const count = signal(0);
const doubled = computed(() => count() * 2);
count.set(5); // Update
```

### inject() Function
```typescript
export class MyComponent {
  private service = inject(MyService);
}
```

### Reactive Forms
```typescript
form = this.fb.group({
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]]
});
```

---

## 🧪 Testing Patterns

```typescript
// Component test
it('should create', () => {
  expect(component).toBeTruthy();
});

// Service test with HttpTestingController
const req = httpMock.expectOne('/api/data');
req.flush(mockData);

// Form validation test
control.setValue('invalid');
expect(control.hasError('required')).toBe(true);
```

---

## 🚀 Deployment Commands

```bash
# Netlify
ng build --configuration production
netlify deploy --prod --dir=dist/my-app

# Firebase
ng build --configuration production
firebase deploy --only hosting

# Vercel
vercel --prod
```

---

## 📚 Essential Links

- [Angular Docs](https://angular.dev)
- [RxJS Docs](https://rxjs.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Your GitHub](https://github.com/cloudshare360/angular-dev)

---

## 💡 Tips

✅ Commit daily (minimum!)  
✅ Test as you build  
✅ Read error messages carefully  
✅ Use DevTools console  
✅ Ask for help when stuck  
✅ Review code before moving on  

---

**Print this and keep it by your desk!** 🖨️

