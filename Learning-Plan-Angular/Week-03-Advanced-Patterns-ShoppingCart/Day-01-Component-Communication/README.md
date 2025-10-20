````markdown
# Day 1: Component Communication Patterns

**Duration**: 3 hours  
**Goal**: Master different ways components communicate in Angular 18.

---

## 🎯 Learning Objectives

- Use @Input and @Output for parent-child communication
- Implement ViewChild and ContentChild
- Share data via services and signals
- Understand when to use each pattern

---

## 📝 Topics Covered

### 1. @Input Decorator (45 minutes)

```typescript
// product-card.component.ts
import { Component, Input } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  template: `
    <div class="card">
      <img [src]="product.image" [alt]="product.name" />
      <h3>{{ product.name }}</h3>
      <p>\${{ product.price }}</p>
    </div>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() showAddButton = true;
}
```

### 2. @Output Decorator (45 minutes)

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  template: `
    <div class="card">
      <img [src]="product.image" [alt]="product.name" />
      <h3>{{ product.name }}</h3>
      <p>\${{ product.price }}</p>
      <button (click)="onAddToCart()">Add to Cart</button>
    </div>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  
  onAddToCart() {
    this.addToCart.emit(this.product);
  }
}

// Parent component
@Component({
  template: `
    <app-product-card 
      [product]="product" 
      (addToCart)="handleAddToCart($event)">
    </app-product-card>
  `
})
export class ProductListComponent {
  handleAddToCart(product: Product) {
    console.log('Adding to cart:', product);
  }
}
```

### 3. Signal-Based Communication (45 minutes)

```typescript
// cart.service.ts
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = signal<CartItem[]>([]);
  
  items = this.cartItems.asReadonly();
  itemCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
  total = computed(() => this.cartItems().reduce((sum, item) => sum + (item.product.price * item.quantity), 0));
  
  addToCart(product: Product) {
    const existing = this.cartItems().find(item => item.product.id === product.id);
    
    if (existing) {
      this.updateQuantity(product.id, existing.quantity + 1);
    } else {
      this.cartItems.update(items => [...items, { product, quantity: 1 }]);
    }
  }
  
  updateQuantity(productId: number, quantity: number) {
    this.cartItems.update(items =>
      items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }
  
  removeFromCart(productId: number) {
    this.cartItems.update(items => items.filter(item => item.product.id !== productId));
  }
}
```

### 4. ViewChild & Template References (30 minutes)

```typescript
import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  template: `
    <input #searchInput type="text" placeholder="Search products..." />
    <button (click)="focusSearch()">Focus Search</button>
  `
})
export class SearchComponent {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  focusSearch() {
    this.searchInput.nativeElement.focus();
  }
}
```

### 5. Hands-On Tasks (15 minutes)

- Create ProductCard component with @Input and @Output
- Build CartService with signals
- Wire ProductList to CartService
- Display cart item count in header

---

## 🏋️ Practice Exercises

1. Create a ProductFilter component that emits filter changes to parent.
2. Implement a rating component with @Input for stars and @Output for rating changes.
3. Build a shared SearchService that multiple components can use.

---

## 📚 Resources

- [Component Interaction](https://angular.dev/guide/component-interaction)
- [Signals Deep Dive](https://angular.dev/guide/signals)

---

## ✅ End of Day Checklist

- [ ] @Input/@Output communication working
- [ ] Signal-based CartService created
- [ ] Product card emitting events
- [ ] Cart count displayed in header
- [ ] Commit changes

````