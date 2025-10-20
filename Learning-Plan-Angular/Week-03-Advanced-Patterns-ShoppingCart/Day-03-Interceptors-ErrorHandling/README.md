````markdown
# Day 3: Interceptors & Error Handling

**Duration**: 3 hours  
**Goal**: Implement HTTP interceptors for logging, auth headers, and global error handling.

---

## 🎯 Learning Objectives

- Create HTTP interceptors
- Add authentication tokens to requests
- Implement global error handling
- Log HTTP requests and responses

---

## 📝 Topics Covered

### 1. HTTP Interceptor Basics (45 minutes)

```typescript
// logging.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  console.log(`[HTTP] ${req.method} ${req.url}`);
  
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === 4) { // HttpResponse
          const elapsed = Date.now() - startTime;
          console.log(`[HTTP] ${req.method} ${req.url} - ${elapsed}ms`);
        }
      },
      error: (error) => {
        console.error(`[HTTP ERROR] ${req.method} ${req.url}:`, error);
      }
    })
  );
};
```

### 2. Auth Token Interceptor (45 minutes)

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  
  return next(req);
};
```

### 3. Error Handling Interceptor (60 minutes)

```typescript
// error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = 'Bad Request';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please log in.';
            break;
          case 403:
            errorMessage = 'Forbidden. You don't have permission.';
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Error Code: ${error.status}`;
        }
      }
      
      notificationService.showError(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
```

### 4. Register Interceptors (30 minutes)

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loggingInterceptor } from './interceptors/logging.interceptor';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        loggingInterceptor,
        authInterceptor,
        errorInterceptor
      ])
    )
  ]
};
```

### 5. Notification Service (30 minutes)

```typescript
// notification.service.ts
import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private idCounter = 0;
  
  notifications$ = this.notifications.asReadonly();
  
  showSuccess(message: string) {
    this.addNotification(message, 'success');
  }
  
  showError(message: string) {
    this.addNotification(message, 'error');
  }
  
  showInfo(message: string) {
    this.addNotification(message, 'info');
  }
  
  private addNotification(message: string, type: Notification['type']) {
    const notification: Notification = {
      message,
      type,
      id: this.idCounter++
    };
    
    this.notifications.update(n => [...n, notification]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => this.dismiss(notification.id), 5000);
  }
  
  dismiss(id: number) {
    this.notifications.update(n => n.filter(notif => notif.id !== id));
  }
}
```

### 6. Notification Component (10 minutes)

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications">
      @for (notif of notifications(); track notif.id) {
        <div class="alert alert-{{ notif.type }}">
          {{ notif.message }}
          <button (click)="dismiss(notif.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
    }
    .alert {
      margin-bottom: 10px;
      padding: 12px 20px;
      border-radius: 4px;
    }
  `]
})
export class NotificationsComponent {
  private notificationService = inject(NotificationService);
  notifications = this.notificationService.notifications$;
  
  dismiss(id: number) {
    this.notificationService.dismiss(id);
  }
}
```

---

## 🏋️ Practice Exercises

1. Add a loading interceptor that shows/hides a global spinner.
2. Implement retry logic in the error interceptor for network failures.
3. Create a request cache interceptor for GET requests.

---

## 📚 Resources

- [HTTP Interceptors](https://angular.dev/guide/http#intercepting-requests-and-responses)
- [Error Handling](https://angular.dev/guide/http#handling-errors)

---

## ✅ End of Day Checklist

- [ ] Logging interceptor implemented
- [ ] Auth interceptor adding tokens
- [ ] Error interceptor with user-friendly messages
- [ ] Notification service and component working
- [ ] All interceptors registered
- [ ] Commit changes

````