````markdown
# Day 5: RxJS Basics & HTTP Client

**Duration**: 3 hours  
**Goal**: Learn RxJS fundamentals and integrate HTTP client for API calls.

---

## 🎯 Learning Objectives

- Understand Observables, Subjects, and common operators
- Use HttpClient for GET, POST, PUT, DELETE
- Handle errors and loading states
- Combine RxJS with Signals (optional but modern)

---

## 📝 Topics Covered

### 1. RxJS Fundamentals (45 minutes)

#### Observable Basics
```typescript
import { Observable, of, from } from 'rxjs';
import { map, filter } from 'rxjs/operators';

const numbers$ = of(1, 2, 3, 4, 5);

numbers$.pipe(
  filter(n => n % 2 === 0),
  map(n => n * 2)
).subscribe(result => console.log(result));
```

#### Common Operators
- `map` — transform values
- `filter` — filter values
- `switchMap` — switch to new observable (cancel previous)
- `catchError` — handle errors
- `tap` — side effects without changing stream

### 2. HTTP Client Setup (30 minutes)

```typescript
// app.config.ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};
```

### 3. Making HTTP Requests (60 minutes)

```typescript
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/employees';
  
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }
  
  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }
  
  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }
  
  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }
  
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### 4. Error Handling (30 minutes)

```typescript
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

getEmployees(): Observable<Employee[]> {
  return this.http.get<Employee[]>(this.apiUrl).pipe(
    catchError(error => {
      console.error('Error fetching employees:', error);
      return throwError(() => new Error('Failed to load employees'));
    })
  );
}
```

### 5. Async Pipe in Templates (15 minutes)

```html
<div *ngIf="employees$ | async as employees; else loading">
  <div *ngFor="let emp of employees">
    {{ emp.firstName }} {{ emp.lastName }}
  </div>
</div>

<ng-template #loading>
  <p>Loading employees...</p>
</ng-template>
```

---

## 🏋️ Practice Exercises

1. Set up JSON Server with mock employee data and integrate HttpClient.
2. Implement loading spinner while fetching data.
3. Add error handling with user-friendly error messages.
4. Use `switchMap` to chain dependent HTTP calls.

---

## 📚 Resources

- [RxJS Documentation](https://rxjs.dev)
- [HttpClient Guide](https://angular.dev/guide/http)
- [JSON Server](https://github.com/typicode/json-server)

---

## ✅ End of Day Checklist

- [ ] RxJS operators practiced (map, filter, switchMap)
- [ ] HttpClient integrated in EmployeeService
- [ ] CRUD operations working with mock API
- [ ] Error handling implemented
- [ ] Loading states managed
- [ ] Commit changes

````