````markdown
# Day 6: Checkout Flow & Forms

**Duration**: 3 hours  
**Goal**: Build a multi-step checkout process with forms and order summary.

---

## 🎯 Learning Objectives

- Create multi-step form wizard
- Validate shipping and payment information
- Implement form navigation and state management
- Generate order summary

---

## 📝 Topics Covered

### 1. Checkout Models (20 minutes)

```typescript
// checkout.model.ts
export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: Partial<PaymentInfo>; // Don't store CVV
  summary: CartSummary;
  createdAt: Date;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
}
```

### 2. Multi-Step Checkout Component (60 minutes)

```typescript
// checkout.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { OrderService } from './order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="checkout-container">
      <h1>Checkout</h1>
      
      <!-- Step Indicator -->
      <div class="steps">
        <div class="step" [class.active]="currentStep() === 1">1. Shipping</div>
        <div class="step" [class.active]="currentStep() === 2">2. Payment</div>
        <div class="step" [class.active]="currentStep() === 3">3. Review</div>
      </div>
      
      <!-- Step 1: Shipping -->
      @if (currentStep() === 1) {
        <form [formGroup]="shippingForm" class="checkout-form">
          <h2>Shipping Address</h2>
          
          <input formControlName="fullName" placeholder="Full Name" />
          @if (shippingForm.get('fullName')?.invalid && shippingForm.get('fullName')?.touched) {
            <small class="error">Full name is required</small>
          }
          
          <input formControlName="address" placeholder="Street Address" />
          <input formControlName="city" placeholder="City" />
          
          <div class="form-row">
            <input formControlName="state" placeholder="State" />
            <input formControlName="zipCode" placeholder="ZIP Code" />
          </div>
          
          <select formControlName="country">
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
          </select>
          
          <button type="button" (click)="nextStep()" [disabled]="shippingForm.invalid">
            Continue to Payment
          </button>
        </form>
      }
      
      <!-- Step 2: Payment -->
      @if (currentStep() === 2) {
        <form [formGroup]="paymentForm" class="checkout-form">
          <h2>Payment Information</h2>
          
          <input formControlName="cardNumber" placeholder="Card Number" maxlength="16" />
          <input formControlName="cardName" placeholder="Name on Card" />
          
          <div class="form-row">
            <input formControlName="expiryDate" placeholder="MM/YY" />
            <input formControlName="cvv" placeholder="CVV" maxlength="3" />
          </div>
          
          <div class="button-group">
            <button type="button" (click)="prevStep()">Back</button>
            <button type="button" (click)="nextStep()" [disabled]="paymentForm.invalid">
              Review Order
            </button>
          </div>
        </form>
      }
      
      <!-- Step 3: Review -->
      @if (currentStep() === 3) {
        <div class="review-section">
          <h2>Order Review</h2>
          
          <div class="review-card">
            <h3>Shipping Address</h3>
            <p>{{ shippingForm.value.fullName }}</p>
            <p>{{ shippingForm.value.address }}</p>
            <p>{{ shippingForm.value.city }}, {{ shippingForm.value.state }} {{ shippingForm.value.zipCode }}</p>
          </div>
          
          <div class="review-card">
            <h3>Payment Method</h3>
            <p>**** **** **** {{ paymentForm.value.cardNumber?.slice(-4) }}</p>
          </div>
          
          <div class="review-card">
            <h3>Order Items</h3>
            @for (item of cart.items(); track item.product.id) {
              <div class="review-item">
                <span>{{ item.product.title }} (x{{ item.quantity }})</span>
                <span>\${{ item.product.price * item.quantity | number:'1.2-2' }}</span>
              </div>
            }
          </div>
          
          <div class="order-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>\${{ summary().subtotal | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Tax:</span>
              <span>\${{ summary().tax | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span>\${{ summary().shipping | number:'1.2-2' }}</span>
            </div>
            <hr />
            <div class="summary-row total">
              <span>Total:</span>
              <span>\${{ summary().total | number:'1.2-2' }}</span>
            </div>
          </div>
          
          <div class="button-group">
            <button (click)="prevStep()">Back</button>
            <button (click)="placeOrder()" class="btn-primary">Place Order</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .steps { display: flex; justify-content: space-between; margin-bottom: 2rem; }
    .step { flex: 1; text-align: center; padding: 1rem; background: #e9ecef; }
    .step.active { background: #007bff; color: white; }
    .checkout-form input, .checkout-form select { width: 100%; padding: 0.75rem; margin-bottom: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .error { color: red; font-size: 0.875rem; }
    .review-card { background: #f8f9fa; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; }
    .button-group { display: flex; gap: 1rem; margin-top: 1rem; }
  `]
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  cart = inject(CartService);
  private orderService = inject(OrderService);
  
  summary = this.cart.summary;
  currentStep = signal(1);
  
  shippingForm = this.fb.group({
    fullName: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    country: ['US', Validators.required]
  });
  
  paymentForm = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    cardName: ['', Validators.required],
    expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
  });
  
  nextStep() {
    if (this.currentStep() < 3) {
      this.currentStep.update(step => step + 1);
    }
  }
  
  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }
  
  placeOrder() {
    const order = {
      items: this.cart.items(),
      shippingAddress: this.shippingForm.value as ShippingAddress,
      paymentInfo: {
        cardNumber: this.paymentForm.value.cardNumber?.slice(-4),
        cardName: this.paymentForm.value.cardName
      },
      summary: this.summary()
    };
    
    this.orderService.createOrder(order).subscribe({
      next: (orderId) => {
        this.cart.clearCart();
        this.router.navigate(['/order-confirmation', orderId]);
      },
      error: (error) => {
        console.error('Order failed:', error);
        alert('Order failed. Please try again.');
      }
    });
  }
}
```

### 3. Order Service (30 minutes)

```typescript
// order.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Order } from './checkout.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  
  createOrder(orderData: Partial<Order>): Observable<string> {
    const order: Order = {
      id: this.generateOrderId(),
      ...orderData as Order,
      createdAt: new Date(),
      status: 'pending'
    };
    
    // Mock API call - replace with real endpoint
    return of(order.id).pipe(delay(1000));
    
    // Real API:
    // return this.http.post<{orderId: string}>('/api/orders', order)
    //   .pipe(map(response => response.orderId));
  }
  
  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}
```

### 4. Order Confirmation Component (30 minutes)

```typescript
// order-confirmation.component.ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="confirmation-container">
      <div class="success-icon">✓</div>
      <h1>Order Confirmed!</h1>
      <p>Thank you for your purchase.</p>
      <p class="order-id">Order ID: {{ orderId }}</p>
      <p>We've sent a confirmation email with order details.</p>
      <a routerLink="/products" class="btn btn-primary">Continue Shopping</a>
    </div>
  `,
  styles: [`
    .confirmation-container {
      max-width: 600px;
      margin: 4rem auto;
      text-align: center;
      padding: 2rem;
    }
    .success-icon {
      font-size: 5rem;
      color: #28a745;
      margin-bottom: 1rem;
    }
    .order-id {
      font-weight: bold;
      font-size: 1.25rem;
      margin: 1rem 0;
    }
  `]
})
export class OrderConfirmationComponent {
  private route = inject(ActivatedRoute);
  orderId = this.route.snapshot.paramMap.get('id') || '';
}
```

---

## 🏋️ Practice Exercises

1. Add form validation for credit card expiry date (not expired).
2. Implement "Remember my address" functionality.
3. Add a "Guest Checkout" option without login.

---

## 📚 Resources

- [Reactive Forms](https://angular.dev/guide/forms/reactive-forms)
- [Multi-Step Forms Best Practices](https://www.nngroup.com/articles/wizard-design/)

---

## ✅ End of Day Checklist

- [ ] Multi-step checkout wizard working
- [ ] All form validations in place
- [ ] Order creation and confirmation flow
- [ ] Cart cleared after successful order
- [ ] Commit changes

````