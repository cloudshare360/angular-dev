````markdown
# Day 2: Components & Templates Deep Dive

**Duration**: 3 hours  
**Goal**: Build reusable components and master template patterns (data binding, events, inputs/outputs).

---

## 🎯 Learning Objectives

- Understand component composition and reusability
- Master property/event binding, two-way binding, and template reference variables
- Use inputs/outputs to pass data between components
- Learn common lifecycle hooks (ngOnInit, ngOnChanges, ngOnDestroy)

---

## 📝 Topics Covered

### 1. Component Composition (45 minutes)
- Create small, focused components (Header, About, ProjectCard, Footer)
- Prefer composition over large monolithic components
- Use the `imports` array on standalone components to wire dependencies

### 2. Templates & Data Binding (45 minutes)
- Interpolation: `{{ value }}`
- Property binding: `[src]`, `[disabled]`
- Event binding: `(click)`
- Two-way binding with `[(ngModel)]` (FormsModule required)
- Template reference variables: `#input` and `localRef.value`

### 3. Inputs & Outputs (30 minutes)
- `@Input()` to receive data
- `@Output()` + `EventEmitter` to emit events upward
- Patterns: Presentational vs Container components

### 4. Lifecycle Hooks (30 minutes)
- `ngOnInit` — initialization logic
- `ngOnChanges` — react to input changes
- `ngOnDestroy` — cleanup (unsubscribe/effects)

### 5. Hands-On Tasks (30 minutes)
- Create `ProjectCardComponent` (standalone) with `@Input() project` and `@Output() open` event
- Create `AboutComponent` with biography and skills list
- Wire components in `AppComponent` to display list of projects

---

## 🏋️ Practice Exercises

1. Build `ProjectCardComponent` with inputs: `title`, `description`, `tags`, `imageUrl` and an output `view` when a user clicks "View".
2. Implement two-way binding on a search input to filter projects by title.
3. Add lifecycle logging to `ProjectCardComponent` to observe `ngOnInit` and `ngOnDestroy` when cards are added/removed.

---

## 📚 Resources
- Angular Templates Guide: https://angular.dev/guide/template-syntax
- Component Interaction: https://angular.dev/guide/component-interaction
- Lifecycle Hooks: https://angular.dev/guide/lifecycle-hooks

---

## ✅ End of Day Checklist
- [ ] ProjectCard & About components created
- [ ] Inputs/Outputs wired and tested
- [ ] Two-way binding search implemented
- [ ] Small commit with meaningful message

````