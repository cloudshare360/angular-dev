````markdown
# Day 2: Firebase Authentication

**Duration**: 3 hours  
**Goal**: Implement Firebase Auth with email/password and Google sign-in.

---

## 🎯 Learning Objectives

- Set up Firebase Authentication
- Implement email/password login
- Add Google Sign-In
- Create auth service and guards
- Build login/logout UI

---

## 📝 Topics Covered

### 1. Enable Auth Methods in Firebase (20 minutes)

1. Go to Firebase Console → Authentication
2. Click "Get Started"
3. Enable Email/Password
4. Enable Google Sign-In (add support email)

### 2. Auth Service (60 minutes)

```typescript
// auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  user,
  User
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  
  user$ = user(this.auth);
  currentUser = toSignal(this.user$);
  isAdmin = signal(false);
  
  constructor() {
    // Check admin role on user change
    this.user$.subscribe(async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult();
        this.isAdmin.set(idTokenResult.claims['admin'] === true);
      } else {
        this.isAdmin.set(false);
      }
    });
  }
  
  async loginWithEmail(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/admin']);
      return credential.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      this.router.navigate(['/admin']);
      return credential.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/']);
  }
  
  isLoggedIn(): boolean {
    return !!this.currentUser();
  }
}
```

### 3. Auth Guard (30 minutes)

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    return true;
  }
  
  return router.parseUrl('/login');
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }
  
  return router.parseUrl('/');
};
```

### 4. Login Component (60 minutes)

```typescript
// login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Admin Login</h2>
        
        @if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        }
        
        <form [formGroup]="loginForm" (ngSubmit)="login()">
          <input
            formControlName="email"
            type="email"
            placeholder="Email"
            class="form-control" />
          
          <input
            formControlName="password"
            type="password"
            placeholder="Password"
            class="form-control" />
          
          <button type="submit" [disabled]="loginForm.invalid || loading()">
            {{ loading() ? 'Logging in...' : 'Login' }}
          </button>
        </form>
        
        <div class="divider">OR</div>
        
        <button (click)="loginWithGoogle()" class="btn-google">
          Sign in with Google
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      width: 400px;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      margin-bottom: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    .btn-google {
      background: #4285f4;
      color: white;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  loading = signal(false);
  error = signal('');
  
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  
  async login() {
    if (this.loginForm.invalid) return;
    
    this.loading.set(true);
    this.error.set('');
    
    const { email, password } = this.loginForm.value;
    
    try {
      await this.authService.loginWithEmail(email!, password!);
    } catch (error: any) {
      this.error.set(error.message);
    } finally {
      this.loading.set(false);
    }
  }
  
  async loginWithGoogle() {
    this.loading.set(true);
    this.error.set('');
    
    try {
      await this.authService.loginWithGoogle();
    } catch (error: any) {
      this.error.set(error.message);
    } finally {
      this.loading.set(false);
    }
  }
}
```

### 5. Protected Routes (20 minutes)

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'editor/:pageId', component: ContentEditorComponent }
    ]
  }
];
```

---

## ✅ End of Day Checklist

- [ ] Firebase Auth enabled
- [ ] Email/password login working
- [ ] Google Sign-In working
- [ ] Auth guards protecting admin routes
- [ ] Login UI complete
- [ ] Commit changes

````