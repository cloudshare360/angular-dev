# Week 5, Day 2: Integration Testing

## 📋 Objectives
By the end of Day 2, you will:
- ✅ Master integration testing patterns in Angular
- ✅ Test component interactions and data flow
- ✅ Test services with real HTTP calls
- ✅ Use Firebase emulators for integration testing
- ✅ Test authentication flows end-to-end
- ✅ Implement test fixtures and data factories

---

## 📚 Topics Covered

### 1. Component Integration Testing

#### Testing Parent-Child Component Interactions
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BlogListComponent } from './blog-list.component';
import { BlogCardComponent } from './blog-card.component';

// Mock child component for isolation
@Component({
  selector: 'app-blog-card',
  template: '<div>Mock Blog Card: {{post.title}}</div>',
  standalone: true
})
class MockBlogCardComponent {
  @Input() post: any;
  @Output() postSelected = new EventEmitter<any>();
  
  selectPost() {
    this.postSelected.emit(this.post);
  }
}

describe('BlogListComponent Integration', () => {
  let component: BlogListComponent;
  let fixture: ComponentFixture<BlogListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogListComponent],
      declarations: [MockBlogCardComponent]
    })
    .overrideComponent(BlogListComponent, {
      remove: { imports: [BlogCardComponent] },
      add: { imports: [MockBlogCardComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogListComponent);
    component = fixture.componentInstance;
  });

  it('should pass posts to child components', () => {
    const mockPosts = [
      { id: '1', title: 'Post 1', content: 'Content 1' },
      { id: '2', title: 'Post 2', content: 'Content 2' }
    ];
    
    component.posts = mockPosts;
    fixture.detectChanges();

    const blogCards = fixture.debugElement.queryAll(By.directive(MockBlogCardComponent));
    expect(blogCards.length).toBe(2);
    expect(blogCards[0].componentInstance.post).toEqual(mockPosts[0]);
    expect(blogCards[1].componentInstance.post).toEqual(mockPosts[1]);
  });

  it('should handle post selection from child component', () => {
    const mockPost = { id: '1', title: 'Selected Post' };
    spyOn(component, 'onPostSelected');
    
    component.posts = [mockPost];
    fixture.detectChanges();

    const blogCard = fixture.debugElement.query(By.directive(MockBlogCardComponent));
    blogCard.componentInstance.postSelected.emit(mockPost);

    expect(component.onPostSelected).toHaveBeenCalledWith(mockPost);
  });
});
```

### 2. Service Integration Testing with HTTP

#### Testing HTTP Services
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BlogService } from './blog.service';
import { environment } from '@/environments/environment';

describe('BlogService Integration', () => {
  let service: BlogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BlogService]
    });
    
    service = TestBed.inject(BlogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch blog posts from API', () => {
    const mockPosts = [
      { id: '1', title: 'Post 1', content: 'Content 1' },
      { id: '2', title: 'Post 2', content: 'Content 2' }
    ];

    service.getAllPosts().subscribe(posts => {
      expect(posts).toEqual(mockPosts);
    });

    const req = httpMock.expectOne(`${environment.api.baseUrl}/posts`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPosts);
  });

  it('should handle HTTP errors gracefully', () => {
    service.getAllPosts().subscribe({
      next: () => fail('Should have failed'),
      error: (error) => {
        expect(error.message).toContain('Failed to fetch posts');
      }
    });

    const req = httpMock.expectOne(`${environment.api.baseUrl}/posts`);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should include authentication headers', () => {
    const token = 'test-auth-token';
    spyOn(localStorage, 'getItem').and.returnValue(token);

    service.createPost({ title: 'New Post', content: 'Content' }).subscribe();

    const req = httpMock.expectOne(`${environment.api.baseUrl}/posts`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({ id: '3' });
  });
});
```

### 3. Firebase Integration Testing

#### Setting up Firebase Emulators
```typescript
// firebase-test-setup.ts
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: 'test-project',
  apiKey: 'test-key',
  authDomain: 'test-project.firebaseapp.com',
  storageBucket: 'test-project.appspot.com'
};

export function setupFirebaseEmulators() {
  const app = initializeApp(firebaseConfig);
  
  const auth = getAuth(app);
  if (!auth.emulatorConfig) {
    connectAuthEmulator(auth, 'http://localhost:9099');
  }
  
  const firestore = getFirestore(app);
  if (!firestore._settings?.host?.includes('localhost')) {
    connectFirestoreEmulator(firestore, 'localhost', 8080);
  }
  
  const storage = getStorage(app);
  if (!storage._host?.includes('localhost')) {
    connectStorageEmulator(storage, 'localhost', 9199);
  }
  
  return { app, auth, firestore, storage };
}
```

#### Testing with Firebase Emulators
```typescript
import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { setupFirebaseEmulators } from '../test-utils/firebase-test-setup';

describe('AuthService Firebase Integration', () => {
  let service: AuthService;
  let auth: Auth;
  let firestore: Firestore;

  beforeAll(() => {
    const { auth: testAuth, firestore: testFirestore } = setupFirebaseEmulators();
    auth = testAuth;
    firestore = testFirestore;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: auth },
        { provide: Firestore, useValue: firestore }
      ]
    });
    
    service = TestBed.inject(AuthService);
  });

  it('should authenticate user with real Firebase', async () => {
    const result = await service.login('test@example.com', 'password123');
    
    expect(result.success).toBe(true);
    expect(result.user?.email).toBe('test@example.com');
  });

  it('should store user data in Firestore', async () => {
    const userData = {
      displayName: 'Test User',
      role: 'admin',
      preferences: { theme: 'dark' }
    };

    await service.updateUserProfile('test-uid', userData);
    
    const storedUser = await service.getUserProfile('test-uid');
    expect(storedUser).toEqual(jasmine.objectContaining(userData));
  });
});
```

### 4. Form Integration Testing

#### Testing Complex Forms
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ContactFormComponent } from './contact-form.component';
import { ContactService } from './contact.service';
import { of, throwError } from 'rxjs';

describe('ContactFormComponent Integration', () => {
  let component: ContactFormComponent;
  let fixture: ComponentFixture<ContactFormComponent>;
  let contactService: jasmine.SpyObj<ContactService>;

  beforeEach(async () => {
    const contactServiceSpy = jasmine.createSpyObj('ContactService', ['submitContact']);

    await TestBed.configureTestingModule({
      imports: [ContactFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ContactService, useValue: contactServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    contactService = TestBed.inject(ContactService) as jasmine.SpyObj<ContactService>;
  });

  it('should submit valid form data', async () => {
    contactService.submitContact.and.returnValue(of({ success: true }));
    
    // Fill form
    const nameInput = fixture.debugElement.query(By.css('[data-test="name-input"]'));
    const emailInput = fixture.debugElement.query(By.css('[data-test="email-input"]'));
    const messageInput = fixture.debugElement.query(By.css('[data-test="message-input"]'));
    
    nameInput.nativeElement.value = 'John Doe';
    emailInput.nativeElement.value = 'john@example.com';
    messageInput.nativeElement.value = 'Test message';
    
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    emailInput.nativeElement.dispatchEvent(new Event('input'));
    messageInput.nativeElement.dispatchEvent(new Event('input'));
    
    fixture.detectChanges();

    // Submit form
    const submitButton = fixture.debugElement.query(By.css('[data-test="submit-button"]'));
    submitButton.nativeElement.click();

    expect(contactService.submitContact).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message'
    });
  });

  it('should display validation errors', () => {
    // Try to submit empty form
    const submitButton = fixture.debugElement.query(By.css('[data-test="submit-button"]'));
    submitButton.nativeElement.click();
    fixture.detectChanges();

    const nameError = fixture.debugElement.query(By.css('[data-test="name-error"]'));
    const emailError = fixture.debugElement.query(By.css('[data-test="email-error"]'));
    
    expect(nameError?.nativeElement.textContent).toContain('Name is required');
    expect(emailError?.nativeElement.textContent).toContain('Email is required');
  });

  it('should handle submission errors', () => {
    contactService.submitContact.and.returnValue(
      throwError(() => new Error('Submission failed'))
    );
    
    component.contactForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message'
    });

    component.onSubmit();
    fixture.detectChanges();

    const errorMessage = fixture.debugElement.query(By.css('[data-test="error-message"]'));
    expect(errorMessage?.nativeElement.textContent).toContain('Submission failed');
  });
});
```

### 5. Router Integration Testing

#### Testing Route Navigation and Guards
```typescript
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Component({ template: 'Admin Dashboard' })
class MockAdminComponent { }

@Component({ template: 'Login Page' })
class MockLoginComponent { }

describe('Router Integration', () => {
  let router: Router;
  let location: Location;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'admin', component: MockAdminComponent, canActivate: [AuthGuard] },
          { path: 'login', component: MockLoginComponent },
          { path: '', redirectTo: '/admin', pathMatch: 'full' }
        ])
      ],
      declarations: [MockAdminComponent, MockLoginComponent],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should navigate to admin when authenticated', async () => {
    authService.isAuthenticated.and.returnValue(true);
    
    await router.navigate(['/admin']);
    
    expect(location.path()).toBe('/admin');
  });

  it('should redirect to login when not authenticated', async () => {
    authService.isAuthenticated.and.returnValue(false);
    
    await router.navigate(['/admin']);
    
    expect(location.path()).toBe('/login');
  });

  it('should handle default route redirect', async () => {
    authService.isAuthenticated.and.returnValue(true);
    
    await router.navigate(['']);
    
    expect(location.path()).toBe('/admin');
  });
});
```

### 6. State Management Integration Testing

#### Testing NgRx Store Integration
```typescript
import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadPosts, selectAllPosts, selectPostsLoading } from '@/store/posts';

@Component({
  template: `
    <div>
      <div *ngIf="loading$ | async">Loading...</div>
      <div *ngFor="let post of posts$ | async" [data-test]="'post-' + post.id">
        {{ post.title }}
      </div>
    </div>
  `
})
class TestPostsComponent {
  posts$ = this.store.select(selectAllPosts);
  loading$ = this.store.select(selectPostsLoading);

  constructor(private store: Store) {}

  loadPosts() {
    this.store.dispatch(loadPosts());
  }
}

describe('Posts Store Integration', () => {
  let component: TestPostsComponent;
  let fixture: ComponentFixture<TestPostsComponent>;
  let store: MockStore;

  const initialState = {
    posts: {
      entities: {},
      ids: [],
      loading: false,
      error: null
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestPostsComponent],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(TestPostsComponent);
    component = fixture.componentInstance;
  });

  it('should display loading state', () => {
    store.overrideSelector(selectPostsLoading, true);
    store.refreshState();
    fixture.detectChanges();

    const loadingEl = fixture.debugElement.query(By.css('[data-test="loading"]'));
    expect(loadingEl?.nativeElement.textContent).toContain('Loading...');
  });

  it('should display posts from store', () => {
    const mockPosts = [
      { id: '1', title: 'Post 1', content: 'Content 1' },
      { id: '2', title: 'Post 2', content: 'Content 2' }
    ];

    store.overrideSelector(selectAllPosts, mockPosts);
    store.refreshState();
    fixture.detectChanges();

    const postElements = fixture.debugElement.queryAll(By.css('[data-test^="post-"]'));
    expect(postElements.length).toBe(2);
    expect(postElements[0].nativeElement.textContent.trim()).toBe('Post 1');
    expect(postElements[1].nativeElement.textContent.trim()).toBe('Post 2');
  });

  it('should dispatch load action', () => {
    spyOn(store, 'dispatch');
    
    component.loadPosts();
    
    expect(store.dispatch).toHaveBeenCalledWith(loadPosts());
  });
});
```

---

## 🔨 Hands-On Exercise

### Exercise 1: Authentication Flow Integration
Test complete login/logout flow with real Firebase.

**Tasks:**
1. Set up Firebase emulators
2. Test login with valid/invalid credentials
3. Test user profile creation and updates
4. Test session persistence and expiration

### Exercise 2: CRUD Operations Integration
Test complete CRUD workflow for content management.

**Tasks:**
1. Test creating content with form validation
2. Test reading content with pagination
3. Test updating content with version history
4. Test deleting content with confirmation

### Exercise 3: E-commerce Cart Integration
Test shopping cart functionality end-to-end.

**Tasks:**
1. Test adding/removing items from cart
2. Test cart persistence across sessions
3. Test checkout flow with validation
4. Test inventory updates after purchase

---

## ✅ Testing Checklist

### Integration Test Coverage
- [ ] Component interaction testing
- [ ] Service integration with HTTP
- [ ] Firebase emulator testing
- [ ] Form validation and submission
- [ ] Route navigation and guards
- [ ] State management integration
- [ ] Error handling scenarios
- [ ] Real data flow testing

---

## 📚 Resources

### Documentation
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Angular Router Testing](https://angular.io/guide/router-testing)

---

## 🎯 Daily Checklist

- [ ] Set up Firebase emulators for integration testing
- [ ] Test component interactions with real data flow
- [ ] Test HTTP services with mock servers
- [ ] Test authentication flows end-to-end
- [ ] Test form submissions with validation
- [ ] Test route navigation and guards
- [ ] Test state management integration
- [ ] Document integration testing patterns
- [ ] Commit with message: "test: comprehensive integration testing with Firebase emulators"

---

**Next**: [Day 3 - E2E Testing with Cypress →](../Day-03-E2E-Cypress/README.md)

**Previous**: [← Day 1 - Unit Testing Mastery](../Day-01-Unit-Testing/README.md)