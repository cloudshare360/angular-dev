````markdown
# Day 2: Route Guards & Lazy Loading

**Duration**: 3 hours  
**Goal**: Protect routes with guards and optimize bundle size with lazy loading.

---

## 🎯 Learning Objectives

- Implement CanActivate and CanDeactivate guards
- Lazy load feature modules/components
- Understand guard return types (boolean, Observable, Promise)

---

## 📝 Topics Covered

### 1. CanActivate Guard (45 minutes)

#### Create an Auth Guard
```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    return true;
  }
  
  return router.parseUrl('/login');
};
```

#### Apply Guard to Route
```typescript
export const routes: Routes = [
  { path: 'employees/:id/edit', component: EmployeeEditComponent, canActivate: [authGuard] }
];
```

### 2. CanDeactivate Guard (45 minutes)

#### Prevent Unsaved Changes
```typescript
import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  return component.canDeactivate ? component.canDeactivate() : true;
};
```

#### Implement in Component
```typescript
export class EmployeeEditComponent implements CanComponentDeactivate {
  hasUnsavedChanges = false;
  
  canDeactivate(): boolean {
    if (this.hasUnsavedChanges) {
      return confirm('You have unsaved changes. Leave anyway?');
    }
    return true;
  }
}
```

### 3. Lazy Loading (60 minutes)

#### Lazy Load Feature Routes
```typescript
export const routes: Routes = [
  {
    path: 'employees',
    loadComponent: () => import('./employees/employee-list.component').then(m => m.EmployeeListComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  }
];
```

### 4. Route Resolvers (30 minutes)

#### Pre-fetch Data Before Route Activation
```typescript
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { EmployeeService } from './employee.service';

export const employeeResolver: ResolveFn<Employee> = (route, state) => {
  const employeeService = inject(EmployeeService);
  const id = route.paramMap.get('id')!;
  return employeeService.getEmployee(id);
};
```

---

## 🏋️ Practice Exercises

1. Create a login page and protect employee edit routes with `authGuard`.
2. Add `unsavedChangesGuard` to edit form and test navigation prevention.
3. Lazy load the admin section and verify bundle splitting in the build output.

---

## 📚 Resources

- [Route Guards](https://angular.dev/guide/router#preventing-unauthorized-access)
- [Lazy Loading](https://angular.dev/guide/lazy-loading-ngmodules)

---

## ✅ End of Day Checklist

- [ ] Auth guard implemented and protecting routes
- [ ] Unsaved changes guard prevents navigation
- [ ] Lazy loading configured and tested
- [ ] Build output shows separate chunks
- [ ] Commit changes

````