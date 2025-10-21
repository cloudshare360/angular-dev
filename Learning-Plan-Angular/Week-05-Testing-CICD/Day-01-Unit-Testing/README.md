# Week 5, Day 1: Unit Testing Mastery

## 📋 Objectives
By the end of Day 1, you will:
- ✅ Master advanced unit testing techniques in Angular
- ✅ Test complex components with mocking strategies
- ✅ Test services with dependency injection
- ✅ Test RxJS observables and async operations
- ✅ Achieve >80% test coverage across projects
- ✅ Implement testing best practices and patterns

---

## 📚 Topics Covered

### 1. Advanced Component Testing

#### Testing Components with Dependencies

**src/app/admin/components/page-editor/page-editor.component.spec.ts**
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PageEditorComponent } from './page-editor.component';
import { PagesService } from '@/core/services/pages.service';
import { AuthService } from '@/core/services/auth.service';
import { HtmlSanitizerService } from '@/core/services/html-sanitizer.service';

describe('PageEditorComponent', () => {
  let component: PageEditorComponent;
  let fixture: ComponentFixture<PageEditorComponent>;
  let pagesService: jasmine.SpyObj<PagesService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    // Create spies for all dependencies
    const pagesServiceSpy = jasmine.createSpyObj('PagesService', 
      ['create', 'update', 'getById']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', 
      ['currentUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const htmlSanitizerSpy = jasmine.createSpyObj('HtmlSanitizerService', 
      ['sanitizeAndBypass', 'extractExcerpt']);

    await TestBed.configureTestingModule({
      imports: [
        PageEditorComponent,
        ReactiveFormsModule
      ],
      providers: [
        { provide: PagesService, useValue: pagesServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: HtmlSanitizerService, useValue: htmlSanitizerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { 
              paramMap: { 
                get: jasmine.createSpy('get').and.returnValue(null) 
              } 
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageEditorComponent);
    component = fixture.componentInstance;
    
    // Get references to spies
    pagesService = TestBed.inject(PagesService) as jasmine.SpyObj<PagesService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);

    // Setup default spy returns
    authService.currentUser.and.returnValue({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    });
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form for new page', () => {
      component.ngOnInit();
      
      expect(component.isEditMode()).toBe(false);
      expect(component.pageForm.get('title')?.value).toBe('');
      expect(component.pageForm.get('slug')?.value).toBe('');
      expect(component.pageForm.get('status')?.value).toBe('draft');
    });

    it('should load existing page in edit mode', () => {
      const mockPage = {
        id: 'existing-id',
        title: 'Existing Page',
        slug: 'existing-page',
        content: '<p>Existing content</p>',
        status: 'published' as const,
        author: 'test@example.com',
        seo: {
          metaTitle: 'Existing Page',
          metaDescription: 'Description',
          keywords: []
        }
      };

      // Mock route parameter
      spyOn(activatedRoute.snapshot.paramMap, 'get').and.returnValue('existing-id');
      pagesService.getById.and.returnValue(of(mockPage));

      component.ngOnInit();

      expect(component.isEditMode()).toBe(true);
      expect(pagesService.getById).toHaveBeenCalledWith('existing-id');
      expect(component.pageForm.get('title')?.value).toBe('Existing Page');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should mark form as invalid when required fields are empty', () => {
      expect(component.pageForm.invalid).toBe(true);
      expect(component.pageForm.get('title')?.hasError('required')).toBe(true);
      expect(component.pageForm.get('slug')?.hasError('required')).toBe(true);
      expect(component.pageForm.get('content')?.hasError('required')).toBe(true);
    });

    it('should mark form as valid when all required fields are filled', () => {
      component.pageForm.patchValue({
        title: 'Valid Title',
        slug: 'valid-slug',
        content: '<p>Valid content</p>',
        seo: {
          metaTitle: 'Meta Title',
          metaDescription: 'Meta Description',
          keywords: []
        }
      });

      expect(component.pageForm.valid).toBe(true);
    });

    it('should show validation errors after form submission attempt', () => {
      component.onSubmit();

      expect(component.pageForm.get('title')?.touched).toBe(true);
      expect(component.pageForm.get('content')?.touched).toBe(true);
      expect(pagesService.create).not.toHaveBeenCalled();
    });
  });

  describe('Slug Generation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should generate slug from title', () => {
      component.pageForm.patchValue({ title: 'My Test Page' });
      component.generateSlug();
      
      expect(component.pageForm.get('slug')?.value).toBe('my-test-page');
    });

    it('should handle special characters in slug', () => {
      component.pageForm.patchValue({ 
        title: 'Page with Special @#$ Characters & Numbers 123!' 
      });
      component.generateSlug();
      
      expect(component.pageForm.get('slug')?.value)
        .toBe('page-with-special-characters-numbers-123');
    });

    it('should handle empty title', () => {
      component.pageForm.patchValue({ title: '' });
      component.generateSlug();
      
      expect(component.pageForm.get('slug')?.value).toBe('');
    });

    it('should trim leading and trailing dashes', () => {
      component.pageForm.patchValue({ title: '  @Test Page!  ' });
      component.generateSlug();
      
      expect(component.pageForm.get('slug')?.value).toBe('test-page');
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.pageForm.patchValue({
        title: 'Test Page',
        slug: 'test-page',
        content: '<p>Test content</p>',
        excerpt: 'Test excerpt',
        seo: {
          metaTitle: 'Test Page',
          metaDescription: 'Test description',
          keywords: ['test']
        },
        status: 'draft'
      });
    });

    it('should create new page successfully', () => {
      pagesService.create.and.returnValue(of('new-page-id'));

      component.onSubmit();

      expect(component.saving()).toBe(false);
      expect(pagesService.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Test Page',
          slug: 'test-page',
          content: '<p>Test content</p>',
          author: 'test@example.com'
        })
      );
      expect(router.navigate).toHaveBeenCalledWith(['/admin/pages']);
    });

    it('should update existing page successfully', () => {
      component.pageId = 'existing-id';
      component.isEditMode.set(true);
      pagesService.update.and.returnValue(of(undefined));

      component.onSubmit();

      expect(pagesService.update).toHaveBeenCalledWith(
        'existing-id',
        jasmine.objectContaining({
          title: 'Test Page',
          slug: 'test-page'
        })
      );
      expect(router.navigate).toHaveBeenCalledWith(['/admin/pages']);
    });

    it('should handle creation errors', () => {
      const errorMessage = 'Failed to create page';
      pagesService.create.and.returnValue(throwError(() => new Error(errorMessage)));
      spyOn(window, 'alert');

      component.onSubmit();

      expect(component.saving()).toBe(false);
      expect(window.alert).toHaveBeenCalledWith(`Failed to save: ${errorMessage}`);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should set loading state during submission', () => {
      pagesService.create.and.returnValue(of('new-page-id'));

      component.onSubmit();

      // Note: In a real test, you might want to test the loading state
      // during the observable execution using fakeAsync and tick()
      expect(pagesService.create).toHaveBeenCalled();
    });
  });

  describe('Preview Functionality', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should toggle preview mode', () => {
      expect(component.showPreview()).toBe(false);

      component.togglePreview();
      expect(component.showPreview()).toBe(true);

      component.togglePreview();
      expect(component.showPreview()).toBe(false);
    });

    it('should sanitize HTML content for preview', () => {
      const htmlSanitizer = TestBed.inject(HtmlSanitizerService) as jasmine.SpyObj<HtmlSanitizerService>;
      const safeHtml = '<p>Safe content</p>';
      htmlSanitizer.sanitizeAndBypass.and.returnValue(safeHtml as any);

      const result = component.sanitizeHtml('<script>alert("xss")</script><p>Safe content</p>');

      expect(htmlSanitizer.sanitizeAndBypass).toHaveBeenCalled();
      expect(result).toBe(safeHtml);
    });
  });

  describe('Auto-save Draft Functionality', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should save as draft when saveDraft is called', () => {
      pagesService.create.and.returnValue(of('new-page-id'));
      component.pageForm.patchValue({
        title: 'Draft Page',
        slug: 'draft-page',
        content: '<p>Draft content</p>',
        status: 'published' // This should be overridden
      });

      component.saveDraft();

      expect(pagesService.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          status: 'draft'
        })
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should handle page loading errors', () => {
      spyOn(activatedRoute.snapshot.paramMap, 'get').and.returnValue('invalid-id');
      pagesService.getById.and.returnValue(throwError(() => new Error('Page not found')));
      spyOn(window, 'alert');

      component.loadPage('invalid-id');

      expect(window.alert).toHaveBeenCalledWith('Failed to load page: Page not found');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/pages']);
    });
  });
});
```

---

### 2. Testing Services with Complex Dependencies

#### Testing Authentication Service

**src/app/core/services/auth.service.spec.ts**
```typescript
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

// Mock Firebase Auth
const mockAuth = {
  currentUser: null as User | null,
  onAuthStateChanged: jasmine.createSpy('onAuthStateChanged')
};

// Mock Firebase Firestore
const mockFirestore = {
  collection: jasmine.createSpy('collection'),
  doc: jasmine.createSpy('doc')
};

// Mock Firebase Auth functions
jest.mock('@angular/fire/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}));

jest.mock('@angular/fire/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn()
}));

describe('AuthService', () => {
  let service: AuthService;
  let router: jasmine.SpyObj<Router>;
  let mockUser: Partial<User>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: mockAuth },
        { provide: Firestore, useValue: mockFirestore },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should login successfully with valid credentials', async () => {
      const mockCredential = { user: mockUser };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockCredential);
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ role: 'admin', permissions: ['read', 'write'] })
      });

      const result = await service.login('test@example.com', 'password').toPromise();

      expect(result.success).toBe(true);
      expect(result.user).toEqual(jasmine.objectContaining({
        uid: 'test-uid',
        email: 'test@example.com'
      }));
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth, 
        'test@example.com', 
        'password'
      );
    });

    it('should handle login errors', async () => {
      const errorMessage = 'Firebase: Error (auth/user-not-found).';
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const result = await service.login('invalid@example.com', 'wrongpassword').toPromise();

      expect(result.success).toBe(false);
      expect(result.error).toContain('User not found');
    });

    it('should logout and redirect to login', () => {
      (signOut as jest.Mock).mockResolvedValue(undefined);

      service.logout();

      expect(signOut).toHaveBeenCalledWith(mockAuth);
      expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
    });
  });

  describe('User State Management', () => {
    it('should track current user state', () => {
      // Mock the auth state change
      const authStateSubject = new BehaviorSubject<User | null>(null);
      mockAuth.onAuthStateChanged.and.callFake((callback: any) => {
        return authStateSubject.subscribe(callback).unsubscribe;
      });

      service = TestBed.inject(AuthService); // Reinitialize to trigger constructor

      // Initially no user
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);

      // User logs in
      authStateSubject.next(mockUser as User);
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);

      // User logs out
      authStateSubject.next(null);
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should load user permissions from Firestore', async () => {
      const mockUserData = {
        role: 'editor',
        permissions: ['read', 'write'],
        lastLogin: new Date(),
        preferences: { theme: 'dark' }
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData
      });

      const permissions = await service.getUserPermissions('test-uid').toPromise();

      expect(permissions).toEqual(mockUserData.permissions);
      expect(doc).toHaveBeenCalledWith(mockFirestore, 'users', 'test-uid');
    });

    it('should handle missing user document', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false
      });

      const permissions = await service.getUserPermissions('nonexistent-uid').toPromise();

      expect(permissions).toEqual([]);
    });
  });

  describe('Permission Checking', () => {
    beforeEach(() => {
      service.currentUser.set({
        ...mockUser,
        permissions: ['read', 'write', 'delete']
      } as any);
    });

    it('should check if user has specific permission', () => {
      expect(service.hasPermission('read')).toBe(true);
      expect(service.hasPermission('write')).toBe(true);
      expect(service.hasPermission('admin')).toBe(false);
    });

    it('should check if user has any of multiple permissions', () => {
      expect(service.hasAnyPermission(['read', 'admin'])).toBe(true);
      expect(service.hasAnyPermission(['admin', 'superuser'])).toBe(false);
    });

    it('should check if user has all required permissions', () => {
      expect(service.hasAllPermissions(['read', 'write'])).toBe(true);
      expect(service.hasAllPermissions(['read', 'write', 'admin'])).toBe(false);
    });
  });

  describe('Error Message Translation', () => {
    it('should translate Firebase auth error codes', () => {
      expect(service.translateErrorCode('auth/user-not-found')).toBe('User not found');
      expect(service.translateErrorCode('auth/wrong-password')).toBe('Incorrect password');
      expect(service.translateErrorCode('auth/invalid-email')).toBe('Invalid email address');
      expect(service.translateErrorCode('auth/unknown-error')).toBe('An unknown error occurred');
    });
  });

  describe('Session Management', () => {
    it('should update last activity timestamp', () => {
      spyOn(service, 'updateLastActivity').and.callThrough();
      
      service.trackActivity();
      
      expect(service.updateLastActivity).toHaveBeenCalled();
    });

    it('should detect session timeout', () => {
      const oldTimestamp = Date.now() - (31 * 60 * 1000); // 31 minutes ago
      spyOn(localStorage, 'getItem').and.returnValue(oldTimestamp.toString());
      
      expect(service.isSessionExpired()).toBe(true);
    });

    it('should not expire active sessions', () => {
      const recentTimestamp = Date.now() - (10 * 60 * 1000); // 10 minutes ago
      spyOn(localStorage, 'getItem').and.returnValue(recentTimestamp.toString());
      
      expect(service.isSessionExpired()).toBe(false);
    });
  });
});
```

---

### 3. Testing RxJS Streams and Async Operations

#### Testing Complex Observable Chains

**src/app/core/services/content-search.service.spec.ts**
```typescript
import { TestBed } from '@angular/core/testing';
import { of, throwError, timer } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { ContentSearchService } from './content-search.service';
import { PagesService } from './pages.service';
import { BlogService } from './blog.service';

describe('ContentSearchService', () => {
  let service: ContentSearchService;
  let pagesService: jasmine.SpyObj<PagesService>;
  let blogService: jasmine.SpyObj<BlogService>;
  let testScheduler: TestScheduler;

  beforeEach(() => {
    const pagesServiceSpy = jasmine.createSpyObj('PagesService', ['getAll', 'search']);
    const blogServiceSpy = jasmine.createSpyObj('BlogService', ['getAll', 'search']);

    TestBed.configureTestingModule({
      providers: [
        ContentSearchService,
        { provide: PagesService, useValue: pagesServiceSpy },
        { provide: BlogService, useValue: blogServiceSpy }
      ]
    });

    service = TestBed.inject(ContentSearchService);
    pagesService = TestBed.inject(PagesService) as jasmine.SpyObj<PagesService>;
    blogService = TestBed.inject(BlogService) as jasmine.SpyObj<BlogService>;

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe('Search Functionality', () => {
    it('should search across multiple content types', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const pages = [
          { id: '1', title: 'Angular Tutorial', content: 'Learn Angular' },
          { id: '2', title: 'React Basics', content: 'React fundamentals' }
        ];
        const posts = [
          { id: '3', title: 'Angular vs React', content: 'Comparison guide' }
        ];

        const pages$ = cold('--a|', { a: pages });
        const posts$ = cold('--b|', { b: posts });

        pagesService.search.and.returnValue(pages$);
        blogService.search.and.returnValue(posts$);

        const result$ = service.searchAll('Angular');

        expectObservable(result$).toBe('--c|', {
          c: {
            pages: [pages[0]], // Only Angular-related page
            posts: [posts[0]], // Angular-related post
            total: 2
          }
        });
      });
    });

    it('should debounce search requests', () => {
      testScheduler.run(({ cold, hot, expectObservable }) => {
        const searchTerm$ = hot('a-b-c----d|', {
          a: 'An',
          b: 'Ang',
          c: 'Angu',
          d: 'Angular'
        });

        const mockResults = [{ id: '1', title: 'Angular Guide' }];
        pagesService.search.and.returnValue(cold('a|', { a: mockResults }));
        blogService.search.and.returnValue(cold('b|', { b: [] }));

        const result$ = service.searchWithDebounce(searchTerm$, 30);

        // Only the last search should be executed after debounce
        expectObservable(result$).toBe('-------a|', {
          a: { pages: mockResults, posts: [], total: 1 }
        });

        expect(pagesService.search).toHaveBeenCalledTimes(1);
        expect(pagesService.search).toHaveBeenCalledWith('Angular');
      });
    });

    it('should handle search errors gracefully', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        pagesService.search.and.returnValue(
          cold('#', {}, new Error('Search failed'))
        );
        blogService.search.and.returnValue(cold('a|', { a: [] }));

        const result$ = service.searchAll('test');

        expectObservable(result$).toBe('a|', {
          a: { pages: [], posts: [], total: 0, error: 'Search failed' }
        });
      });
    });
  });

  describe('Real-time Search Updates', () => {
    it('should emit search results as user types', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        const input$ = hot('a-b-c-d-e|', {
          a: 'A',
          b: 'An',
          c: 'Ang',
          d: 'Angu',
          e: 'Angular'
        });

        // Mock different results for different search terms
        pagesService.search.and.callFake((term: string) => {
          if (term.length < 3) return cold('a|', { a: [] });
          return cold('a|', { a: [{ id: '1', title: `Results for ${term}` }] });
        });
        blogService.search.and.returnValue(cold('a|', { a: [] }));

        const result$ = service.liveSearch(input$);

        expectObservable(result$).toBe('----a-b-c|', {
          a: { pages: [{ id: '1', title: 'Results for Ang' }], posts: [], total: 1 },
          b: { pages: [{ id: '1', title: 'Results for Angu' }], posts: [], total: 1 },
          c: { pages: [{ id: '1', title: 'Results for Angular' }], posts: [], total: 1 }
        });
      });
    });
  });

  describe('Search Caching', () => {
    it('should cache search results', () => {
      const mockResults = [{ id: '1', title: 'Cached Result' }];
      pagesService.search.and.returnValue(of(mockResults));
      blogService.search.and.returnValue(of([]));

      // First search
      service.searchAll('Angular').subscribe();
      expect(pagesService.search).toHaveBeenCalledTimes(1);

      // Second search with same term should use cache
      service.searchAll('Angular').subscribe();
      expect(pagesService.search).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should invalidate cache after timeout', () => {
      testScheduler.run(({ cold, expectObservable, flush }) => {
        const mockResults = [{ id: '1', title: 'Result' }];
        pagesService.search.and.returnValue(cold('a|', { a: mockResults }));
        blogService.search.and.returnValue(cold('a|', { a: [] }));

        // First search
        service.searchAll('Angular').subscribe();
        
        // Fast forward past cache timeout
        testScheduler.flush();
        
        // Search again after cache timeout
        service.searchAll('Angular').subscribe();
        
        expect(pagesService.search).toHaveBeenCalledTimes(2);
      });
    });
  });
});
```

---

### 4. Testing Pipes and Utilities

#### Testing Custom Pipes

**src/app/shared/pipes/truncate.pipe.spec.ts**
```typescript
import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should truncate long text', () => {
    const longText = 'This is a very long text that should be truncated';
    const result = pipe.transform(longText, 20);
    expect(result).toBe('This is a very long...');
  });

  it('should not truncate short text', () => {
    const shortText = 'Short text';
    const result = pipe.transform(shortText, 20);
    expect(result).toBe('Short text');
  });

  it('should handle custom suffix', () => {
    const text = 'This is a long text';
    const result = pipe.transform(text, 10, ' [more]');
    expect(result).toBe('This is a [more]');
  });

  it('should handle edge cases', () => {
    expect(pipe.transform('', 10)).toBe('');
    expect(pipe.transform(null as any, 10)).toBe('');
    expect(pipe.transform(undefined as any, 10)).toBe('');
    expect(pipe.transform('test', 0)).toBe('...');
  });

  it('should handle HTML content', () => {
    const htmlText = '<p>This is <strong>HTML</strong> content</p>';
    const result = pipe.transform(htmlText, 15, '...', true);
    expect(result).not.toContain('<p>');
    expect(result).not.toContain('<strong>');
    expect(result.length).toBeLessThanOrEqual(18); // 15 + '...'
  });
});
```

#### Testing Utility Functions

**src/app/shared/utils/form-validators.spec.ts**
```typescript
import { FormControl } from '@angular/forms';
import { CustomValidators } from './form-validators';

describe('CustomValidators', () => {
  describe('slugValidator', () => {
    it('should pass for valid slug', () => {
      const control = new FormControl('valid-slug-123');
      const result = CustomValidators.slug(control);
      expect(result).toBeNull();
    });

    it('should fail for invalid characters', () => {
      const control = new FormControl('invalid slug!');
      const result = CustomValidators.slug(control);
      expect(result).toEqual({ slug: true });
    });

    it('should fail for uppercase letters', () => {
      const control = new FormControl('Invalid-Slug');
      const result = CustomValidators.slug(control);
      expect(result).toEqual({ slug: true });
    });

    it('should fail for leading/trailing dashes', () => {
      const control = new FormControl('-invalid-slug-');
      const result = CustomValidators.slug(control);
      expect(result).toEqual({ slug: true });
    });
  });

  describe('passwordStrength', () => {
    it('should pass for strong password', () => {
      const control = new FormControl('StrongPass123!');
      const result = CustomValidators.passwordStrength(control);
      expect(result).toBeNull();
    });

    it('should fail for weak password', () => {
      const control = new FormControl('weak');
      const result = CustomValidators.passwordStrength(control);
      expect(result).toEqual({ passwordStrength: { 
        score: jasmine.any(Number),
        requirements: jasmine.any(Array)
      }});
    });
  });

  describe('asyncEmailValidator', () => {
    it('should validate unique email', (done) => {
      const control = new FormControl('new@example.com');
      const validator = CustomValidators.asyncEmailValidator(
        { checkEmailExists: () => of(false) } as any
      );

      validator(control).subscribe(result => {
        expect(result).toBeNull();
        done();
      });
    });

    it('should fail for existing email', (done) => {
      const control = new FormControl('existing@example.com');
      const validator = CustomValidators.asyncEmailValidator(
        { checkEmailExists: () => of(true) } as any
      );

      validator(control).subscribe(result => {
        expect(result).toEqual({ emailExists: true });
        done();
      });
    });
  });
});
```

---

### 5. Test Coverage and Reporting

#### Setting up Test Coverage

**package.json**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --watchAll=false",
    "test:coverage-report": "jest --coverage && open coverage/lcov-report/index.html"
  },
  "jest": {
    "preset": "jest-preset-angular",
    "setupFilesAfterEnv": ["<rootDir>/setup-jest.ts"],
    "testPathIgnorePatterns": [
      "<rootDir>/node_modules/",
      "<rootDir>/dist/",
      "<rootDir>/cypress/"
    ],
    "collectCoverageFrom": [
      "src/app/**/*.ts",
      "!src/app/**/*.spec.ts",
      "!src/app/**/*.module.ts",
      "!src/app/**/index.ts",
      "!src/app/**/*.interface.ts",
      "!src/app/**/*.model.ts",
      "!src/app/**/*.d.ts"
    ],
    "coverageReporters": ["html", "text", "lcov"],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

#### Jest Configuration

**setup-jest.ts**
```typescript
import 'jest-preset-angular/setup-jest';

// Mock Firebase
Object.defineProperty(window, 'firebase', {
  value: {
    apps: [],
    initializeApp: jest.fn(),
    auth: jest.fn(() => ({
      currentUser: null,
      signInWithEmailAndPassword: jest.fn(),
      signOut: jest.fn()
    })),
    firestore: jest.fn(() => ({
      collection: jest.fn(),
      doc: jest.fn()
    }))
  }
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
});

// Mock IntersectionObserver
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Suppress console.warn in tests
global.console.warn = jest.fn();
```

---

## 🔨 Hands-On Exercise

### Exercise 1: Test Coverage Improvement
Improve test coverage for your existing components.

**Tasks:**
1. Run coverage report and identify uncovered code
2. Write tests for uncovered branches and edge cases
3. Add tests for error scenarios
4. Achieve >80% coverage for all components

### Exercise 2: Advanced Component Testing
Test complex component interactions.

**Tasks:**
1. Test components with child components
2. Test event emissions and property bindings
3. Test component lifecycle hooks
4. Test components with route parameters

### Exercise 3: Service Integration Testing
Test services with real dependencies.

**Tasks:**
1. Test services with HTTP client
2. Test services with Firebase integration
3. Test error handling and retry logic
4. Test service caching mechanisms

---

## ✅ Testing Best Practices

### Test Structure
- **Arrange**: Set up test data and mocks
- **Act**: Execute the function/method being tested
- **Assert**: Verify the expected outcome

### Naming Conventions
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition is met', () => {
      // Test implementation
    });
  });
});
```

### Mock Strategy
- Mock external dependencies
- Use spies for tracking method calls
- Mock only what's necessary for the test
- Keep mocks close to the test that uses them

---

## 📚 Resources

### Documentation
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [RxJS Testing](https://rxjs.dev/guide/testing)

### Best Practices
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Angular Testing Library](https://testing-library.com/docs/angular-testing-library/intro/)

---

## 🎯 Daily Checklist

- [ ] Set up Jest testing framework with coverage
- [ ] Write comprehensive component tests
- [ ] Test all services with proper mocking
- [ ] Test async operations and RxJS streams
- [ ] Test custom pipes and utilities
- [ ] Achieve >80% test coverage
- [ ] Set up automated coverage reporting
- [ ] Create testing documentation
- [ ] Review and refactor existing tests
- [ ] Commit with message: "test: comprehensive unit testing with >80% coverage"

---

**Next**: [Day 2 - Integration Testing →](../Day-02-Integration-Testing/README.md)

**Previous**: [← Week 5 Overview](../README.md)