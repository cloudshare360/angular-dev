````markdown
# Day 7: Testing & Optimization

**Duration**: 3 hours  
**Goal**: Write comprehensive tests and optimize the shopping cart application.

---

## 🎯 Learning Objectives

- Test complex components and services
- Test HTTP interceptors
- Optimize bundle size and performance
- Achieve 80%+ code coverage

---

## 📝 Topics Covered

### 1. Testing Cart Service (60 minutes)

```typescript
// cart.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  
  const mockProduct = {
    id: 1,
    title: 'Test Product',
    price: 99.99,
    image: 'test.jpg',
    category: 'test'
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('should add product to cart', () => {
    service.addToCart(mockProduct, 2);
    
    expect(service.items().length).toBe(1);
    expect(service.items()[0].quantity).toBe(2);
    expect(service.itemCount()).toBe(2);
  });

  it('should increase quantity for existing product', () => {
    service.addToCart(mockProduct, 1);
    service.addToCart(mockProduct, 1);
    
    expect(service.items().length).toBe(1);
    expect(service.items()[0].quantity).toBe(2);
  });

  it('should remove product from cart', () => {
    service.addToCart(mockProduct, 1);
    service.removeFromCart(mockProduct.id);
    
    expect(service.items().length).toBe(0);
    expect(service.isEmpty()).toBe(true);
  });

  it('should calculate subtotal correctly', () => {
    service.addToCart(mockProduct, 2);
    
    expect(service.subtotal()).toBe(199.98);
  });

  it('should calculate tax correctly', () => {
    service.addToCart(mockProduct, 1);
    const expectedTax = 99.99 * 0.08;
    
    expect(service.tax()).toBeCloseTo(expectedTax, 2);
  });

  it('should apply free shipping over threshold', () => {
    const expensiveProduct = { ...mockProduct, price: 100 };
    service.addToCart(expensiveProduct, 1);
    
    expect(service.shipping()).toBe(0);
  });

  it('should persist to localStorage', () => {
    service.addToCart(mockProduct, 1);
    
    const stored = localStorage.getItem('shopping_cart');
    expect(stored).toBeTruthy();
    
    const parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].product.id).toBe(mockProduct.id);
  });

  it('should load from localStorage on init', () => {
    const cartData = [{ product: mockProduct, quantity: 3 }];
    localStorage.setItem('shopping_cart', JSON.stringify(cartData));
    
    const newService = TestBed.inject(CartService);
    expect(newService.items().length).toBe(1);
    expect(newService.items()[0].quantity).toBe(3);
  });
});
```

### 2. Testing Checkout Component (45 minutes)

```typescript
// checkout.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CheckoutComponent } from './checkout.component';
import { CartService } from '../cart/cart.service';
import { OrderService } from './order.service';
import { of } from 'rxjs';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let orderService: jasmine.SpyObj<OrderService>;

  beforeEach(async () => {
    const orderServiceSpy = jasmine.createSpyObj('OrderService', ['createOrder']);

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: OrderService, useValue: orderServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    fixture.detectChanges();
  });

  it('should start at step 1', () => {
    expect(component.currentStep()).toBe(1);
  });

  it('should validate shipping form', () => {
    expect(component.shippingForm.valid).toBe(false);
    
    component.shippingForm.patchValue({
      fullName: 'John Doe',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US'
    });
    
    expect(component.shippingForm.valid).toBe(true);
  });

  it('should not proceed to next step with invalid form', () => {
    component.nextStep();
    expect(component.currentStep()).toBe(1); // Should stay on step 1
  });

  it('should proceed to step 2 with valid shipping form', () => {
    component.shippingForm.patchValue({
      fullName: 'John Doe',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US'
    });
    
    component.nextStep();
    expect(component.currentStep()).toBe(2);
  });

  it('should place order with valid forms', () => {
    orderService.createOrder.and.returnValue(of('ORDER-123'));
    
    component.shippingForm.patchValue({
      fullName: 'John Doe',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US'
    });
    
    component.paymentForm.patchValue({
      cardNumber: '1234567890123456',
      cardName: 'John Doe',
      expiryDate: '12/25',
      cvv: '123'
    });
    
    component.currentStep.set(3);
    component.placeOrder();
    
    expect(orderService.createOrder).toHaveBeenCalled();
  });
});
```

### 3. Testing Interceptors (30 minutes)

```typescript
// error.interceptor.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should handle 404 errors', (done) => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.message).toContain('not found');
        done();
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });
});
```

### 4. Performance Optimization (45 minutes)

#### Bundle Analysis
```bash
# Install webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer

# Build with stats
ng build --stats-json

# Analyze
npx webpack-bundle-analyzer dist/my-shop/stats.json
```

#### Lazy Loading Optimization
```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'products',
    loadComponent: () => import('./products/product-list.component')
      .then(m => m.ProductListComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.component')
      .then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout.component')
      .then(m => m.CheckoutComponent)
  }
];
```

#### Image Optimization
```typescript
// Use modern image formats and lazy loading
@Component({
  template: `
    <img 
      [src]="product.image" 
      [alt]="product.title"
      loading="lazy"
      width="300"
      height="300" />
  `
})
```

#### OnPush Change Detection
```typescript
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {}
```

---

## 🏋️ Practice Exercises

1. Write E2E tests for the complete checkout flow using Cypress.
2. Optimize images using WebP format and srcset.
3. Implement virtual scrolling for long product lists.

---

## 📚 Resources

- [Testing Guide](https://angular.dev/guide/testing)
- [Performance Best Practices](https://angular.dev/guide/performance)
- [Bundle Optimization](https://angular.dev/guide/build#optimization)

---

## ✅ End of Day Checklist

- [ ] 10+ unit tests written (cart, checkout, services)
- [ ] Interceptor tests passing
- [ ] Code coverage >80%
- [ ] Bundle analyzed and optimized
- [ ] Lazy loading implemented
- [ ] Performance audit completed
- [ ] Commit changes

---

## 🎉 Week 3 Complete!

You now have a production-ready shopping cart with:
- ✅ Component communication patterns
- ✅ HTTP client and API integration
- ✅ Interceptors for auth and errors
- ✅ Environment configuration
- ✅ Cart state with persistence
- ✅ Complete checkout flow
- ✅ Comprehensive testing
- ✅ Performance optimization

**Next Week**: Build a CMS for Small Business (aasoftnet.com clone) with auth, content management, and versioning!

````