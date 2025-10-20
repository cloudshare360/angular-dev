````markdown
# Day 4: Signals & Reactivity

**Duration**: 3 hours  
**Goal**: Learn Angular Signals and apply them to app state (theme, project list, UI flags).

---

## 🎯 Learning Objectives
- Understand `signal()`, `computed()`, and `effect()`
- Replace local RxJS usage with Signals where appropriate
- Use Signals for dark mode, project filtering, and UI state

---

## 📝 Topics Covered

### 1. Signals Basics (45 minutes)
- `import { signal, computed, effect } from '@angular/core'`
- Creating and updating signals
- Reading signals in templates

### 2. Computed Signals & Effects (45 minutes)
- `computed()` for derived state
- `effect()` for side effects (e.g., localStorage sync)

### 3. Integrating Signals with Components (30 minutes)
- Provide signals via services or as local component state
- Prefer `inject()` for services using signals

### 4. Dark Mode with Signals (30 minutes)
- Implement a `themeSignal` that toggles `'light' | 'dark'`
- Persist preference in `localStorage` via an `effect()`

### 5. Hands-On Tasks (30 minutes)
- Implement dark mode toggle using Signals
- Use a computed signal to return filtered projects based on `searchSignal`
- Add an effect to write theme preference and project favorites to `localStorage`

---

## 🏋️ Practice Exercises
1. Replace a simple `BehaviorSubject` in a small service with a `signal` and update the UI to consume it.
2. Create an `isMobile` computed signal that reacts to window size and toggles layout classes.
3. Ensure that signals are cleaned up or provided in a way that avoids memory leaks.

---

## 📚 Resources
- Signals Guide: https://angular.dev/guide/signals
- `inject()` docs: https://angular.dev/guide/dependency-injection

---

## ✅ End of Day Checklist
- [ ] Dark mode implemented with Signals
- [ ] Project filtering powered by computed signals
- [ ] State persisted with `effect()` to `localStorage`
- [ ] Commit changes

````