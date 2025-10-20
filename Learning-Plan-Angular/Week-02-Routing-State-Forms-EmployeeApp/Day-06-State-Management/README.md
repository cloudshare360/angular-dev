````markdown
# Day 6: State Management Patterns

**Duration**: 3 hours  
**Goal**: Implement centralized state management using services with Signals or BehaviorSubject.

---

## 🎯 Learning Objectives

- Understand service-based state management
- Use BehaviorSubject for reactive state
- Compare Signals vs RxJS for state
- Implement optimistic updates

---

## 📝 Topics Covered

### 1. BehaviorSubject State Pattern (45 minutes)

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmployeeStateService {
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  employees$: Observable<Employee[]> = this.employeesSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  
  setEmployees(employees: Employee[]) {
    this.employeesSubject.next(employees);
  }
  
  setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }
  
  addEmployee(employee: Employee) {
    const current = this.employeesSubject.value;
    this.employeesSubject.next([...current, employee]);
  }
}
```

### 2. Signals-Based State (Modern Approach) (45 minutes)

```typescript
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EmployeeStore {
  // Private state
  private employeesSignal = signal<Employee[]>([]);
  private loadingSignal = signal<boolean>(false);
  private filterSignal = signal<string>('');
  
  // Public readonly signals
  employees = this.employeesSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  
  // Computed/derived state
  filteredEmployees = computed(() => {
    const filter = this.filterSignal().toLowerCase();
    return this.employeesSignal().filter(emp =>
      emp.firstName.toLowerCase().includes(filter) ||
      emp.lastName.toLowerCase().includes(filter)
    );
  });
  
  employeeCount = computed(() => this.employeesSignal().length);
  
  // Actions
  setEmployees(employees: Employee[]) {
    this.employeesSignal.set(employees);
  }
  
  addEmployee(employee: Employee) {
    this.employeesSignal.update(list => [...list, employee]);
  }
  
  updateEmployee(id: number, updates: Partial<Employee>) {
    this.employeesSignal.update(list =>
      list.map(emp => emp.id === id ? { ...emp, ...updates } : emp)
    );
  }
  
  deleteEmployee(id: number) {
    this.employeesSignal.update(list => list.filter(emp => emp.id !== id));
  }
  
  setFilter(filter: string) {
    this.filterSignal.set(filter);
  }
}
```

### 3. Optimistic Updates (30 minutes)

```typescript
deleteEmployee(id: number) {
  // Optimistic update
  const backup = this.employeesSignal();
  this.employeesSignal.update(list => list.filter(emp => emp.id !== id));
  
  // API call
  this.http.delete(`${this.apiUrl}/${id}`).subscribe({
    error: (err) => {
      // Rollback on error
      this.employeesSignal.set(backup);
      console.error('Delete failed:', err);
    }
  });
}
```

### 4. Signals vs RxJS Comparison (30 minutes)

| Feature | Signals | RxJS |
|---------|---------|------|
| Reactivity | Pull-based | Push-based |
| Complexity | Simple | More operators |
| Use Case | UI state | Async streams |
| Performance | Fast, fine-grained | Good, but overhead |
| Learning Curve | Easier | Steeper |

**Recommendation**: Use Signals for simple reactive state, RxJS for complex async flows.

### 5. Hands-On Tasks (30 minutes)

- Refactor EmployeeService to use EmployeeStore with Signals
- Implement search/filter using computed signals
- Add optimistic updates for delete operation

---

## 🏋️ Practice Exercises

1. Create a computed signal that shows employees by department.
2. Add undo/redo functionality using state history.
3. Compare performance of Signals vs BehaviorSubject for large lists.

---

## 📚 Resources

- [Angular Signals](https://angular.dev/guide/signals)
- [RxJS BehaviorSubject](https://rxjs.dev/api/index/class/BehaviorSubject)
- [State Management Patterns](https://blog.angular.io/state-management-with-signals-3f8d7e7e0e99)

---

## ✅ End of Day Checklist

- [ ] Centralized state service created
- [ ] Signals or BehaviorSubject pattern implemented
- [ ] Computed values working (filtered list, counts)
- [ ] Optimistic updates tested
- [ ] Commit changes

````