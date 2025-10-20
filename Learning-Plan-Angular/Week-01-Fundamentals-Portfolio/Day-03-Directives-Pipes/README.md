````markdown
# Day 3: Directives & Pipes

**Duration**: 3 hours  
**Goal**: Learn built-in directives and create custom directives and pipes to enhance templates.

---

## 🎯 Learning Objectives
- Use structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`)
- Use attribute directives (`[ngClass]`, `[ngStyle]`) and create custom attribute directives
- Create custom pipes for formatting and transformation

---

## 📝 Topics Covered

### 1. Structural Directives (30 minutes)
- `*ngIf`, `*ngFor`, `*ngSwitch`
- `trackBy` function for performance in lists

### 2. Attribute Directives (30 minutes)
- `[ngClass]`, `[ngStyle]`
- Create a `HighlightDirective` that changes element background on hover

### 3. Custom Pipes (45 minutes)
- Pure vs impure pipes
- Create a `truncate` pipe to shorten long descriptions
- Date & currency formatting pipes

### 4. Performance Tips (30 minutes)
- Use `trackBy` with long lists
- Avoid heavy computation inside templates
- Prefer pipes for repeated formatting

### 5. Hands-On Tasks (45 minutes)
- Implement `HighlightDirective`
- Build a `truncate` pipe and use it in `ProjectCardComponent`
- Add a filter dropdown that uses a pipe to filter project tags

---

## 🏋️ Practice Exercises
1. Create `HighlightDirective` that accepts an input color and toggles on hover.
2. Create `CapitalizePipe` that capitalizes project titles.
3. Optimize a projects list by adding a `trackBy` function to the `*ngFor` loop.

---

## 📚 Resources
- Directives Guide: https://angular.dev/guide/structural-directives
- Pipes Guide: https://angular.dev/guide/pipes

---

## ✅ End of Day Checklist
- [ ] Custom attribute directive implemented and tested
- [ ] Custom pipes created and used in templates
- [ ] `trackBy` added for project lists
- [ ] Commit changes

````