````markdown
# Day 4: Services & Dependency Injection

**Duration**: 3 hours  
**Goal**: Create services with `inject()` and understand Angular DI system.

---

## 🎯 Learning Objectives

- Create injectable services with `providedIn: 'root'`
- Use `inject()` function instead of constructor injection
- Understand service hierarchy and scopes
- Share data between components via services

---

## 📝 Topics Covered

### 1. Creating a Service (30 minutes)

```typescript
import { Injectable, signal } from '@angular/core';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private employees = signal<Employee[]>([
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', department: 'IT' }
  ]);
  
  getEmployees() {
    return this.employees.asReadonly();
  }
  
  addEmployee(employee: Employee) {
    this.employees.update(list => [...list, employee]);
  }
  
  updateEmployee(id: number, updates: Partial<Employee>) {
    this.employees.update(list =>
      list.map(emp => emp.id === id ? { ...emp, ...updates } : emp)
    );
  }
  
  deleteEmployee(id: number) {
    this.employees.update(list => list.filter(emp => emp.id !== id));
  }
}
```

### 2. Using inject() Function (45 minutes)

#### Modern Approach (Angular 14+)
```typescript
import { Component, inject } from '@angular/core';
import { EmployeeService } from './employee.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  template: `
    <div *ngFor="let emp of employees()">
      {{ emp.firstName }} {{ emp.lastName }}
    </div>
  `
})
export class EmployeeListComponent {
  private employeeService = inject(EmployeeService);
  employees = this.employeeService.getEmployees();
}
```

#### Old Constructor Approach (Still Valid)
```typescript
constructor(private employeeService: EmployeeService) {}
```

### 3. Service Hierarchy & Scopes (30 minutes)

- `providedIn: 'root'` → Singleton across entire app
- `providedIn: ComponentName` → One instance per component tree
- Provided in route config → One instance per lazy-loaded module

### 4. Communication Between Components (45 minutes)

#### Parent-Child: Use @Input/@Output
#### Sibling Components: Use Shared Service

```typescript
@Injectable({ providedIn: 'root' })
export class MessageService {
  private messageSubject = new Subject<string>();
  message$ = this.messageSubject.asObservable();
  
  sendMessage(msg: string) {
    this.messageSubject.next(msg);
  }
}
```

### 5. Hands-On Tasks (30 minutes)

- Create `EmployeeService` with CRUD methods
- Use service in `EmployeeListComponent` and `EmployeeFormComponent`
- Add employee via form and see list update reactively

---

## 🏋️ Practice Exercises

1. Create a `LoggerService` that logs all employee CRUD operations.
2. Implement a `NotificationService` that shows success/error messages.
3. Use `inject()` in a route guard to access `AuthService`.

---

## 📚 Resources

- [Dependency Injection Guide](https://angular.dev/guide/dependency-injection)
- [inject() Function](https://angular.dev/api/core/inject)

---

## ✅ End of Day Checklist

- [ ] EmployeeService created with CRUD methods
- [ ] Service injected using `inject()` function
- [ ] Data shared between components via service
- [ ] Service hierarchy understood
- [ ] Commit changes

````