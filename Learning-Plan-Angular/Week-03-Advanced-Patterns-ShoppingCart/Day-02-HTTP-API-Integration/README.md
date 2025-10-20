````markdown
# Day 2: HTTP Client & API Integration

**Duration**: 3 hours  
**Goal**: Integrate real or mock API using HttpClient and display products.

---

## 🎯 Learning Objectives

- Set up JSON Server or use FakeStore API
- Fetch products via HttpClient
- Handle loading and error states
- Implement caching strategies

---

## 📝 Topics Covered

### 1. API Options (20 minutes)

#### Option A: JSON Server (Local Mock API)
```bash
npm install -g json-server
```

```json
// db.json
{
  "products": [
    { "id": 1, "name": "Laptop", "price": 999, "image": "laptop.jpg", "category": "electronics" },
    { "id": 2, "name": "Phone", "price": 699, "image": "phone.jpg", "category": "electronics" }
  ]
}
```

```bash
json-server --watch db.json --port 3000
```

#### Option B: FakeStore API (Public API)
```
https://fakestoreapi.com/products
```

### 2. Product Service with HttpClient (60 minutes)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { rate: number; count: number };
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'https://fakestoreapi.com/products';
  
  private productsCache = new BehaviorSubject<Product[] | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  products$ = this.productsCache.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  
  fetchProducts(): Observable<Product[]> {
    // Return cached data if available
    if (this.productsCache.value) {
      return of(this.productsCache.value);
    }
    
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap(products => {
        this.productsCache.next(products);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next('Failed to load products');
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }
  
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
  
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${category}`);
  }
}
```

### 3. Component Integration (45 minutes)

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from './product.service';
import { ProductCardComponent } from './product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="container">
      <h1>Products</h1>
      
      @if (loading$ | async) {
        <div class="spinner">Loading...</div>
      }
      
      @if (error$ | async; as error) {
        <div class="alert alert-danger">{{ error }}</div>
      }
      
      @if (products$ | async; as products) {
        <div class="product-grid">
          @for (product of products; track product.id) {
            <app-product-card 
              [product]="product"
              (addToCart)="handleAddToCart($event)">
            </app-product-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
      padding: 1rem;
    }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  
  products$ = this.productService.products$;
  loading$ = this.productService.loading$;
  error$ = this.productService.error$;
  
  ngOnInit() {
    this.productService.fetchProducts().subscribe();
  }
  
  handleAddToCart(product: Product) {
    // Will connect to CartService tomorrow
    console.log('Add to cart:', product);
  }
}
```

### 4. Error Handling & Retry Logic (30 minutes)

```typescript
import { retry, delay } from 'rxjs/operators';

fetchProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(this.apiUrl).pipe(
    retry({ count: 3, delay: 1000 }),
    tap(products => this.productsCache.next(products)),
    catchError(error => {
      this.errorSubject.next('Failed after 3 retries');
      return of([]);
    })
  );
}
```

### 5. Hands-On Tasks (25 minutes)

- Set up JSON Server or use FakeStore API
- Create ProductService with caching
- Display products in grid layout
- Add loading spinner and error messages

---

## 🏋️ Practice Exercises

1. Add search functionality that filters products by title.
2. Implement category filter dropdown.
3. Add pagination for large product lists.

---

## 📚 Resources

- [HttpClient Guide](https://angular.dev/guide/http)
- [JSON Server](https://github.com/typicode/json-server)
- [FakeStore API](https://fakestoreapi.com)

---

## ✅ End of Day Checklist

- [ ] API integration working (JSON Server or FakeStore)
- [ ] Products displayed in grid
- [ ] Loading and error states handled
- [ ] Caching implemented
- [ ] Commit changes

````