````markdown
# Day 4: Environment Configuration

**Duration**: 3 hours  
**Goal**: Set up environment files for dev/prod and implement feature flags.

---

## 🎯 Learning Objectives

- Configure environment files
- Use environment variables in services
- Implement feature toggles
- Build for different environments

---

## 📝 Topics Covered

### 1. Environment Files Structure (30 minutes)

```typescript
// src/environments/environment.ts (Development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiKey: 'dev-api-key-123',
  enableLogging: true,
  features: {
    darkMode: true,
    analytics: false,
    newCheckout: true
  }
};
```

```typescript
// src/environments/environment.prod.ts (Production)
export const environment = {
  production: true,
  apiUrl: 'https://api.myshop.com',
  apiKey: 'prod-api-key-xyz',
  enableLogging: false,
  features: {
    darkMode: true,
    analytics: true,
    newCheckout: false
  }
};
```

### 2. Configure angular.json (30 minutes)

```json
{
  "projects": {
    "my-shop": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "extractLicenses": true,
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                }
              ]
            },
            "development": {
              "optimization": false,
              "sourceMap": true,
              "extractLicenses": false
            }
          }
        }
      }
    }
  }
}
```

### 3. Using Environment in Services (45 minutes)

```typescript
// product.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  
  fetchProducts() {
    if (environment.enableLogging) {
      console.log('Fetching products from:', this.apiUrl);
    }
    
    return this.http.get(`${this.apiUrl}/products`);
  }
}
```

### 4. Feature Flags Service (45 minutes)

```typescript
// feature-flags.service.ts
import { Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private features = signal(environment.features);
  
  isEnabled(featureName: keyof typeof environment.features): boolean {
    return this.features()[featureName] ?? false;
  }
  
  enable(featureName: keyof typeof environment.features) {
    this.features.update(f => ({ ...f, [featureName]: true }));
  }
  
  disable(featureName: keyof typeof environment.features) {
    this.features.update(f => ({ ...f, [featureName]: false }));
  }
}
```

### 5. Using Feature Flags in Components (30 minutes)

```typescript
import { Component, inject } from '@angular/core';
import { FeatureFlagsService } from './feature-flags.service';

@Component({
  selector: 'app-checkout',
  template: `
    @if (showNewCheckout) {
      <app-new-checkout></app-new-checkout>
    } @else {
      <app-old-checkout></app-old-checkout>
    }
  `
})
export class CheckoutComponent {
  private featureFlags = inject(FeatureFlagsService);
  showNewCheckout = this.featureFlags.isEnabled('newCheckout');
}
```

### 6. Build Commands (20 minutes)

```bash
# Development build
ng build --configuration development

# Production build
ng build --configuration production

# Serve with specific configuration
ng serve --configuration development
```

### 7. Environment-Specific Interceptors (20 minutes)

```typescript
// logging.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.enableLogging) {
    return next(req);
  }
  
  console.log('[HTTP]', req.method, req.url);
  return next(req);
};
```

---

## 🏋️ Practice Exercises

1. Add a staging environment with its own configuration.
2. Create a feature flag for "guest checkout" and conditionally show/hide UI.
3. Add environment-specific analytics tracking.

---

## 📚 Resources

- [Build Configurations](https://angular.dev/guide/build#configuring-application-environments)
- [Feature Flags Best Practices](https://martinfowler.com/articles/feature-toggles.html)

---

## ✅ End of Day Checklist

- [ ] Environment files created for dev/prod
- [ ] angular.json configured for file replacement
- [ ] Services using environment variables
- [ ] Feature flags service implemented
- [ ] Production build tested
- [ ] Commit changes

````