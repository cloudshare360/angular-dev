````markdown
# Day 5: Shopping Cart State & Persistence

**Duration**: 3 hours  
**Goal**: Build a fully functional shopping cart with localStorage persistence.

---

## 🎯 Learning Objectives

- Implement cart state with Signals
- Persist cart data to localStorage
- Handle cart operations (add, update, remove)
- Calculate totals and taxes

---

## 📝 Topics Covered

### 1. Cart Models & Types (20 minutes)

```typescript
// cart.model.ts
export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}
```

### 2. Cart Service with Signals (90 minutes)

```typescript
// cart.service.ts
import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem, Product, CartSummary } from './cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly TAX_RATE = 0.08; // 8% tax
  private readonly SHIPPING_THRESHOLD = 50;
  private readonly SHIPPING_COST = 5.99;
  private readonly STORAGE_KEY = 'shopping_cart';
  
  // State
  private cartItems = signal<CartItem[]>(this.loadFromStorage());
  
  // Public readonly signals
  items = this.cartItems.asReadonly();
  
  // Computed values
  itemCount = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );
  
  subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  );
  
  tax = computed(() => this.subtotal() * this.TAX_RATE);
  
  shipping = computed(() =>
    this.subtotal() >= this.SHIPPING_THRESHOLD ? 0 : this.SHIPPING_COST
  );
  
  total = computed(() => this.subtotal() + this.tax() + this.shipping());
  
  summary = computed<CartSummary>(() => ({
    subtotal: this.subtotal(),
    tax: this.tax(),
    shipping: this.shipping(),
    total: this.total()
  }));
  
  isEmpty = computed(() => this.cartItems().length === 0);
  
  constructor() {
    // Auto-save to localStorage on changes
    effect(() => {
      this.saveToStorage(this.cartItems());
    });
  }
  
  // Actions
  addToCart(product: Product, quantity: number = 1) {
    const existing = this.cartItems().find(item => item.product.id === product.id);
    
    if (existing) {
      this.updateQuantity(product.id, existing.quantity + quantity);
    } else {
      this.cartItems.update(items => [...items, { product, quantity }]);
    }
  }
  
  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    
    this.cartItems.update(items =>
      items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }
  
  removeFromCart(productId: number) {
    this.cartItems.update(items =>
      items.filter(item => item.product.id !== productId)
    );
  }
  
  clearCart() {
    this.cartItems.set([]);
  }
  
  // Persistence
  private loadFromStorage(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
      return [];
    }
  }
  
  private saveToStorage(items: CartItem[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  }
}
```

### 3. Cart Component (45 minutes)

```typescript
// cart.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from './cart.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-container">
      <h1>Shopping Cart</h1>
      
      @if (cart.isEmpty()) {
        <div class="empty-cart">
          <p>Your cart is empty</p>
          <a routerLink="/products" class="btn btn-primary">Continue Shopping</a>
        </div>
      } @else {
        <div class="cart-items">
          @for (item of cart.items(); track item.product.id) {
            <div class="cart-item">
              <img [src]="item.product.image" [alt]="item.product.title" />
              <div class="item-details">
                <h3>{{ item.product.title }}</h3>
                <p class="price">\${{ item.product.price }}</p>
              </div>
              <div class="quantity-controls">
                <button (click)="decreaseQty(item.product.id)">-</button>
                <span>{{ item.quantity }}</span>
                <button (click)="increaseQty(item.product.id)">+</button>
              </div>
              <p class="item-total">\${{ item.product.price * item.quantity | number:'1.2-2' }}</p>
              <button (click)="remove(item.product.id)" class="btn-remove">Remove</button>
            </div>
          }
        </div>
        
        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>\${{ summary().subtotal | number:'1.2-2' }}</span>
          </div>
          <div class="summary-row">
            <span>Tax (8%):</span>
            <span>\${{ summary().tax | number:'1.2-2' }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping:</span>
            <span>{{ summary().shipping === 0 ? 'FREE' : '$' + (summary().shipping | number:'1.2-2') }}</span>
          </div>
          <hr />
          <div class="summary-row total">
            <span>Total:</span>
            <span>\${{ summary().total | number:'1.2-2' }}</span>
          </div>
          <button routerLink="/checkout" class="btn btn-success btn-checkout">
            Proceed to Checkout
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .cart-item { display: flex; gap: 1rem; padding: 1rem; border-bottom: 1px solid #ddd; }
    .cart-item img { width: 80px; height: 80px; object-fit: cover; }
    .quantity-controls { display: flex; align-items: center; gap: 0.5rem; }
    .cart-summary { margin-top: 2rem; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
    .total { font-weight: bold; font-size: 1.25rem; }
    .btn-checkout { width: 100%; margin-top: 1rem; }
  `]
})
export class CartComponent {
  cart = inject(CartService);
  summary = this.cart.summary;
  
  increaseQty(productId: number) {
    const item = this.cart.items().find(i => i.product.id === productId);
    if (item) {
      this.cart.updateQuantity(productId, item.quantity + 1);
    }
  }
  
  decreaseQty(productId: number) {
    const item = this.cart.items().find(i => i.product.id === productId);
    if (item) {
      this.cart.updateQuantity(productId, item.quantity - 1);
    }
  }
  
  remove(productId: number) {
    if (confirm('Remove this item from cart?')) {
      this.cart.removeFromCart(productId);
    }
  }
}
```

### 4. Cart Icon Component (25 minutes)

```typescript
// cart-icon.component.ts
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart-icon',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/cart" class="cart-icon">
      🛒 
      @if (itemCount() > 0) {
        <span class="badge">{{ itemCount() }}</span>
      }
    </a>
  `,
  styles: [`
    .cart-icon { position: relative; font-size: 1.5rem; }
    .badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: red;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 0.75rem;
    }
  `]
})
export class CartIconComponent {
  private cart = inject(CartService);
  itemCount = this.cart.itemCount;
}
```

---

## 🏋️ Practice Exercises

1. Add a "Save for Later" feature that moves items to a separate list.
2. Implement a discount/promo code system.
3. Add product recommendations based on cart contents.

---

## 📚 Resources

- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Angular Signals](https://angular.dev/guide/signals)

---

## ✅ End of Day Checklist

- [ ] Cart service with signals implemented
- [ ] Cart persisted to localStorage
- [ ] Cart component with CRUD operations
- [ ] Cart icon with item count badge
- [ ] Totals calculated correctly
- [ ] Commit changes

````