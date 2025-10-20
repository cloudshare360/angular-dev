# Week 4, Day 3: Content Models & Firestore CRUD

## 📋 Objectives
By the end of Day 3, you will:
- ✅ Design Firestore collections and document schemas for CMS content
- ✅ Create TypeScript interfaces for type safety
- ✅ Implement CRUD operations for content management
- ✅ Build content listing and editing components
- ✅ Handle relationships between content types
- ✅ Implement real-time data synchronization

---

## 📚 Topics Covered

### 1. CMS Content Architecture

#### Core Content Types
**Pages** - Static content pages (About, Services, etc.)
```typescript
interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  status: 'draft' | 'published' | 'archived';
  author: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}
```

**Blog Posts** - Dynamic content with categories/tags
```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: {
    uid: string;
    name: string;
    email: string;
  };
  status: 'draft' | 'published' | 'scheduled';
  views: number;
  likes: number;
  comments: number;
  seo: SEOMetadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  scheduledFor?: Timestamp;
}
```

**Portfolio Items** - Projects or case studies
```typescript
interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  client: string;
  projectDate: Timestamp;
  images: string[];
  thumbnail: string;
  technologies: string[];
  category: string;
  url?: string;
  featured: boolean;
  order: number;
  status: 'draft' | 'published';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Services** - Company services/offerings
```typescript
interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  features: string[];
  pricing?: {
    amount: number;
    currency: string;
    period: 'one-time' | 'monthly' | 'yearly';
  };
  order: number;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 2. Firestore Collection Structure

```
/pages                    → Static pages collection
  /{pageId}              → Individual page document

/blog-posts              → Blog posts collection
  /{postId}              → Individual post document
    /comments            → Subcollection for comments
      /{commentId}       → Individual comment

/portfolio              → Portfolio items collection
  /{itemId}             → Individual portfolio item

/services               → Services collection
  /{serviceId}          → Individual service

/categories             → Categories for posts
  /{categoryId}         → Category document

/tags                   → Tags collection
  /{tagId}              → Tag document

/users                  → Users/Authors collection
  /{userId}             → User profile and settings
```

---

### 3. Content Service Implementation

#### Base Content Service (Generic CRUD)

**src/app/core/services/content-base.service.ts**
```typescript
import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  CollectionReference,
  DocumentData,
  QueryConstraint
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export interface BaseContent {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export abstract class ContentBaseService<T extends BaseContent> {
  protected firestore = inject(Firestore);
  protected abstract collectionName: string;

  protected get collectionRef(): CollectionReference<DocumentData> {
    return collection(this.firestore, this.collectionName);
  }

  // CREATE
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Observable<string> {
    const newData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    return from(addDoc(this.collectionRef, newData)).pipe(
      map(docRef => docRef.id)
    );
  }

  // READ - Get by ID
  getById(id: string): Observable<T | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(getDoc(docRef)).pipe(
      map(snapshot => {
        if (!snapshot.exists()) return null;
        return { id: snapshot.id, ...snapshot.data() } as T;
      })
    );
  }

  // READ - Get all with optional filters
  getAll(constraints: QueryConstraint[] = []): Observable<T[]> {
    const q = query(this.collectionRef, ...constraints);
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as T))
      )
    );
  }

  // UPDATE
  update(id: string, data: Partial<T>): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    const updateData = {
      ...data,
      updatedAt: Timestamp.now()
    };
    
    return from(updateDoc(docRef, updateData));
  }

  // DELETE
  delete(id: string): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(docRef));
  }

  // QUERY - Published items only
  getPublished(limitCount = 10): Observable<T[]> {
    const constraints = [
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    ];
    return this.getAll(constraints);
  }
}
```

---

### 4. Specific Content Services

#### Pages Service

**src/app/core/services/pages.service.ts**
```typescript
import { Injectable } from '@angular/core';
import { ContentBaseService } from './content-base.service';
import { Observable } from 'rxjs';
import { where, orderBy } from '@angular/fire/firestore';

export interface Page {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  status: 'draft' | 'published' | 'archived';
  author: string;
  createdAt?: any;
  updatedAt?: any;
  publishedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PagesService extends ContentBaseService<Page> {
  protected collectionName = 'pages';

  getBySlug(slug: string): Observable<Page | null> {
    return this.getAll([where('slug', '==', slug)]).pipe(
      map(pages => pages.length > 0 ? pages[0] : null)
    );
  }

  getPublishedPages(): Observable<Page[]> {
    return this.getAll([
      where('status', '==', 'published'),
      orderBy('title', 'asc')
    ]);
  }
}
```

#### Blog Posts Service

**src/app/core/services/blog.service.ts**
```typescript
import { Injectable } from '@angular/core';
import { ContentBaseService } from './content-base.service';
import { Observable } from 'rxjs';
import { where, orderBy, limit } from '@angular/fire/firestore';

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: {
    uid: string;
    name: string;
    email: string;
  };
  status: 'draft' | 'published' | 'scheduled';
  views: number;
  likes: number;
  comments: number;
  createdAt?: any;
  updatedAt?: any;
  publishedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService extends ContentBaseService<BlogPost> {
  protected collectionName = 'blog-posts';

  getBySlug(slug: string): Observable<BlogPost | null> {
    return this.getAll([where('slug', '==', slug)]).pipe(
      map(posts => posts.length > 0 ? posts[0] : null)
    );
  }

  getByCategory(category: string, limitCount = 10): Observable<BlogPost[]> {
    return this.getAll([
      where('category', '==', category),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    ]);
  }

  getByTag(tag: string, limitCount = 10): Observable<BlogPost[]> {
    return this.getAll([
      where('tags', 'array-contains', tag),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    ]);
  }

  incrementViews(id: string): Observable<void> {
    return this.getById(id).pipe(
      switchMap(post => {
        if (!post) throw new Error('Post not found');
        return this.update(id, { views: (post.views || 0) + 1 });
      })
    );
  }
}
```

---

### 5. Content Management Components

#### Content List Component

**src/app/admin/components/content-list/content-list.component.ts**
```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PagesService, Page } from '@/core/services/pages.service';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Pages</h2>
        <a routerLink="/admin/pages/new" class="btn btn-primary">
          <i class="bi bi-plus-circle"></i> New Page
        </a>
      </div>

      @if (loading()) {
        <div class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      @if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }

      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Author</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (page of pages(); track page.id) {
              <tr>
                <td>{{ page.title }}</td>
                <td>
                  <span class="badge" 
                    [class.bg-success]="page.status === 'published'"
                    [class.bg-warning]="page.status === 'draft'"
                    [class.bg-secondary]="page.status === 'archived'">
                    {{ page.status }}
                  </span>
                </td>
                <td>{{ page.author }}</td>
                <td>{{ page.updatedAt?.toDate() | date:'short' }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <a [routerLink]="['/admin/pages/edit', page.id]" 
                       class="btn btn-outline-primary">
                      <i class="bi bi-pencil"></i>
                    </a>
                    <button (click)="deletePage(page.id!)" 
                            class="btn btn-outline-danger">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ContentListComponent implements OnInit {
  private pagesService = inject(PagesService);

  pages = signal<Page[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadPages();
  }

  loadPages() {
    this.loading.set(true);
    this.error.set(null);

    this.pagesService.getAll().subscribe({
      next: (pages) => {
        this.pages.set(pages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load pages: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  deletePage(id: string) {
    if (!confirm('Are you sure you want to delete this page?')) return;

    this.pagesService.delete(id).subscribe({
      next: () => {
        this.pages.update(pages => pages.filter(p => p.id !== id));
      },
      error: (err) => {
        alert('Failed to delete page: ' + err.message);
      }
    });
  }
}
```

#### Content Editor Component

**src/app/admin/components/content-editor/content-editor.component.ts**
```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PagesService, Page } from '@/core/services/pages.service';
import { AuthService } from '@/core/services/auth.service';

@Component({
  selector: 'app-content-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <h2>{{ isEditMode() ? 'Edit Page' : 'New Page' }}</h2>

      <form [formGroup]="pageForm" (ngSubmit)="onSubmit()">
        <!-- Title -->
        <div class="mb-3">
          <label class="form-label">Title *</label>
          <input type="text" class="form-control" formControlName="title"
                 (blur)="generateSlug()">
          @if (pageForm.get('title')?.invalid && pageForm.get('title')?.touched) {
            <div class="text-danger">Title is required</div>
          }
        </div>

        <!-- Slug -->
        <div class="mb-3">
          <label class="form-label">Slug *</label>
          <input type="text" class="form-control" formControlName="slug">
          <small class="text-muted">URL-friendly version of the title</small>
        </div>

        <!-- Excerpt -->
        <div class="mb-3">
          <label class="form-label">Excerpt</label>
          <textarea class="form-control" rows="3" 
                    formControlName="excerpt"></textarea>
        </div>

        <!-- Content -->
        <div class="mb-3">
          <label class="form-label">Content *</label>
          <textarea class="form-control" rows="15" 
                    formControlName="content"></textarea>
        </div>

        <!-- SEO Section -->
        <div class="card mb-3">
          <div class="card-header">SEO Settings</div>
          <div class="card-body" formGroupName="seo">
            <div class="mb-3">
              <label class="form-label">Meta Title</label>
              <input type="text" class="form-control" 
                     formControlName="metaTitle">
            </div>
            <div class="mb-3">
              <label class="form-label">Meta Description</label>
              <textarea class="form-control" rows="2" 
                        formControlName="metaDescription"></textarea>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="mb-3">
          <label class="form-label">Status</label>
          <select class="form-select" formControlName="status">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary" 
                  [disabled]="pageForm.invalid || saving()">
            {{ saving() ? 'Saving...' : 'Save' }}
          </button>
          <button type="button" class="btn btn-secondary" 
                  (click)="cancel()">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `
})
export class ContentEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pagesService = inject(PagesService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  saving = signal(false);
  pageId: string | null = null;

  pageForm = this.fb.group({
    title: ['', Validators.required],
    slug: ['', Validators.required],
    excerpt: [''],
    content: ['', Validators.required],
    seo: this.fb.group({
      metaTitle: [''],
      metaDescription: [''],
      keywords: [[]]
    }),
    status: ['draft']
  });

  ngOnInit() {
    this.pageId = this.route.snapshot.paramMap.get('id');
    
    if (this.pageId) {
      this.isEditMode.set(true);
      this.loadPage(this.pageId);
    }
  }

  loadPage(id: string) {
    this.pagesService.getById(id).subscribe({
      next: (page) => {
        if (page) {
          this.pageForm.patchValue(page);
        }
      },
      error: (err) => {
        alert('Failed to load page: ' + err.message);
        this.router.navigate(['/admin/pages']);
      }
    });
  }

  generateSlug() {
    const title = this.pageForm.get('title')?.value || '';
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    this.pageForm.patchValue({ slug });
  }

  onSubmit() {
    if (this.pageForm.invalid) return;

    this.saving.set(true);
    const formValue = this.pageForm.value;
    const currentUser = this.authService.currentUser();

    const pageData: any = {
      ...formValue,
      author: currentUser?.email || 'Anonymous'
    };

    const operation = this.isEditMode() && this.pageId
      ? this.pagesService.update(this.pageId, pageData)
      : this.pagesService.create(pageData);

    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/pages']);
      },
      error: (err) => {
        this.saving.set(false);
        alert('Failed to save page: ' + err.message);
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/pages']);
  }
}
```

---

## 🔨 Hands-On Exercise

### Exercise 1: Add Portfolio Service
Create a portfolio service with CRUD operations for portfolio items.

**Tasks:**
1. Define `PortfolioItem` interface
2. Create `PortfolioService` extending `ContentBaseService`
3. Add methods for filtering by category and featured items
4. Implement sorting by order field

### Exercise 2: Build Category Management
Create a system to manage blog post categories.

**Tasks:**
1. Create `Category` interface
2. Build `CategoriesService`
3. Create admin UI to add/edit/delete categories
4. Link categories to blog posts

### Exercise 3: Implement Search Functionality
Add search capability across content types.

**Tasks:**
1. Create a search service
2. Implement full-text search (consider Algolia integration)
3. Build search results component
4. Add search to admin dashboard

---

## ✅ Testing Guidelines

### Unit Testing Content Services

```typescript
// pages.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { PagesService } from './pages.service';
import { Firestore } from '@angular/fire/firestore';

describe('PagesService', () => {
  let service: PagesService;
  let firestoreMock: jasmine.SpyObj<Firestore>;

  beforeEach(() => {
    firestoreMock = jasmine.createSpyObj('Firestore', ['collection']);
    
    TestBed.configureTestingModule({
      providers: [
        PagesService,
        { provide: Firestore, useValue: firestoreMock }
      ]
    });
    
    service = TestBed.inject(PagesService);
  });

  it('should create page with timestamps', (done) => {
    const pageData = {
      title: 'Test Page',
      slug: 'test-page',
      content: 'Test content',
      status: 'draft' as const,
      author: 'test@example.com',
      seo: {
        metaTitle: 'Test',
        metaDescription: 'Test',
        keywords: []
      }
    };

    service.create(pageData).subscribe({
      next: (id) => {
        expect(id).toBeTruthy();
        done();
      }
    });
  });
});
```

---

## 📚 Resources

### Official Documentation
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firestore Queries](https://firebase.google.com/docs/firestore/query-data/queries)
- [Angular Fire](https://github.com/angular/angularfire)

### Best Practices
- Use TypeScript interfaces for type safety
- Implement proper error handling in services
- Add loading states in components
- Use transactions for complex updates
- Consider pagination for large datasets

---

## 🎯 Daily Checklist

- [ ] Define all content type interfaces
- [ ] Create Firestore collection structure
- [ ] Implement base content service with generic CRUD
- [ ] Create specific services for each content type
- [ ] Build content list component with delete functionality
- [ ] Build content editor component with form validation
- [ ] Add slug generation utility
- [ ] Test all CRUD operations
- [ ] Implement error handling and loading states
- [ ] Commit with message: "feat(cms): implement content models and Firestore CRUD"

---

**Next**: [Day 4 - WYSIWYG Editor Integration →](../Day-04-WYSIWYG-Editor/README.md)

**Previous**: [← Day 2 - Firebase Authentication](../Day-02-Firebase-Auth/README.md)
