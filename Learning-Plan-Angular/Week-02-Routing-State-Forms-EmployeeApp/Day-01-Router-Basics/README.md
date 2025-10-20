````markdown
# Day 1: Angular Router Basics

**Duration**: 3 hours  
**Goal**: Set up Angular Router, create multiple routes, and implement navigation between views.

---

## 🎯 Learning Objectives

- Configure Angular Router in a standalone app
- Create route definitions and components
- Navigate programmatically and via RouterLink
- Access route parameters and query params

---

## 📝 Topics Covered

### 1. Router Setup (30 minutes)

#### Configure Routes in `app.config.ts`
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};
```

#### Define Routes in `app.routes.ts`
```typescript
import { Routes } from '@angular/router';
import { EmployeeListComponent } from './employees/employee-list.component';
import { EmployeeDetailComponent } from './employees/employee-detail.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'employees', component: EmployeeListComponent },
  { path: 'employees/:id', component: EmployeeDetailComponent },
  { path: '**', redirectTo: '' }
];
```

### 2. Navigation (45 minutes)

#### Using RouterLink
```html
<nav>
  <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
  <a routerLink="/employees" routerLinkActive="active">Employees</a>
</nav>
<router-outlet></router-outlet>
```

#### Programmatic Navigation
```typescript
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export class EmployeeListComponent {
  private router = inject(Router);
  
  viewEmployee(id: number) {
    this.router.navigate(['/employees', id]);
  }
}
```

### 3. Route Parameters (45 minutes)

#### Reading Route Params
```typescript
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  template: `<h2>Employee ID: {{ employeeId }}</h2>`
})
export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  employeeId: string | null = null;

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    // Or subscribe for dynamic updates:
    // this.route.paramMap.subscribe(params => {
    //   this.employeeId = params.get('id');
    // });
  }
}
```

### 4. Child Routes (30 minutes)

```typescript
export const routes: Routes = [
  {
    path: 'employees',
    component: EmployeesLayoutComponent,
    children: [
      { path: '', component: EmployeeListComponent },
      { path: ':id', component: EmployeeDetailComponent },
      { path: ':id/edit', component: EmployeeEditComponent }
    ]
  }
];
```

### 5. Hands-On Tasks (30 minutes)

- Create `EmployeeListComponent`, `EmployeeDetailComponent`, `HomeComponent`
- Set up routes and navigation between them
- Add a navbar with active link highlighting
- Pass employee ID via route params and display it

---

## 🏋️ Practice Exercises

1. Create a "Not Found" component and route `**` to it.
2. Add query parameters to filter employees by department: `/employees?dept=IT`.
3. Implement breadcrumb navigation using route data.

---

## 📚 Resources

- [Router Guide](https://angular.dev/guide/routing)
- [ActivatedRoute API](https://angular.dev/api/router/ActivatedRoute)

---

## ✅ End of Day Checklist

- [ ] Routes configured and working
- [ ] Navigation via RouterLink and programmatically
- [ ] Route parameters read and displayed
- [ ] Navbar with active route highlighting
- [ ] Commit changes

````