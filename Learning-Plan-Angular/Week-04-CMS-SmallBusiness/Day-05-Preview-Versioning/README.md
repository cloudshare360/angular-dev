# Week 4, Day 5: Preview Mode & Versioning

## 📋 Objectives
By the end of Day 5, you will:
- ✅ Implement draft vs published content states
- ✅ Create version history and rollback functionality
- ✅ Build preview mode with version banners
- ✅ Handle content scheduling and publishing workflows
- ✅ Implement content approval processes
- ✅ Add content comparison between versions

---

## 📚 Topics Covered

### 1. Content States and Workflow

#### Content Lifecycle States
```typescript
export type ContentStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived' | 'scheduled';

export interface ContentWorkflow {
  currentStatus: ContentStatus;
  nextPossibleStates: ContentStatus[];
  requiresApproval: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
}
```

#### Content Version Interface
```typescript
export interface ContentVersion {
  id: string;
  contentId: string;
  contentType: 'page' | 'blog-post' | 'portfolio' | 'service';
  versionNumber: number;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  seo: SEOMetadata;
  status: ContentStatus;
  author: {
    uid: string;
    name: string;
    email: string;
  };
  changes: VersionChange[];
  createdAt: Timestamp;
  publishedAt?: Timestamp;
  scheduledFor?: Timestamp;
  isCurrentVersion: boolean;
  isPublishedVersion: boolean;
}

export interface VersionChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'create' | 'update' | 'delete';
}
```

---

### 2. Version Management Service

#### Content Versioning Service

**src/app/core/services/content-versioning.service.ts**
```typescript
import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  runTransaction
} from '@angular/fire/firestore';
import { Observable, from, map, switchMap } from 'rxjs';
import { ContentVersion, VersionChange, ContentStatus } from '../models/content.model';

@Injectable({
  providedIn: 'root'
})
export class ContentVersioningService {
  private firestore = inject(Firestore);

  // Create new version
  createVersion(
    contentId: string, 
    contentType: string, 
    contentData: any, 
    authorData: any,
    changes: VersionChange[] = []
  ): Observable<string> {
    return this.getLatestVersion(contentId).pipe(
      switchMap(latestVersion => {
        const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
        
        const newVersion: Omit<ContentVersion, 'id'> = {
          contentId,
          contentType: contentType as any,
          versionNumber,
          title: contentData.title,
          content: contentData.content,
          excerpt: contentData.excerpt,
          featuredImage: contentData.featuredImage,
          seo: contentData.seo,
          status: contentData.status || 'draft',
          author: authorData,
          changes,
          createdAt: Timestamp.now(),
          isCurrentVersion: true,
          isPublishedVersion: false
        };

        return from(runTransaction(this.firestore, async (transaction) => {
          // Mark previous version as not current
          if (latestVersion) {
            const prevVersionRef = doc(this.firestore, 'content-versions', latestVersion.id);
            transaction.update(prevVersionRef, { isCurrentVersion: false });
          }

          // Add new version
          const versionsRef = collection(this.firestore, 'content-versions');
          const newVersionRef = doc(versionsRef);
          transaction.set(newVersionRef, newVersion);
          
          return newVersionRef.id;
        }));
      })
    );
  }

  // Get all versions for content
  getVersionHistory(contentId: string): Observable<ContentVersion[]> {
    const q = query(
      collection(this.firestore, 'content-versions'),
      where('contentId', '==', contentId),
      orderBy('versionNumber', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ContentVersion))
      )
    );
  }

  // Get latest version
  getLatestVersion(contentId: string): Observable<ContentVersion | null> {
    const q = query(
      collection(this.firestore, 'content-versions'),
      where('contentId', '==', contentId),
      where('isCurrentVersion', '==', true),
      limit(1)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as ContentVersion;
      })
    );
  }

  // Get published version
  getPublishedVersion(contentId: string): Observable<ContentVersion | null> {
    const q = query(
      collection(this.firestore, 'content-versions'),
      where('contentId', '==', contentId),
      where('isPublishedVersion', '==', true),
      limit(1)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as ContentVersion;
      })
    );
  }

  // Publish a version
  publishVersion(versionId: string): Observable<void> {
    return from(runTransaction(this.firestore, async (transaction) => {
      const versionRef = doc(this.firestore, 'content-versions', versionId);
      const versionDoc = await transaction.get(versionRef);
      
      if (!versionDoc.exists()) {
        throw new Error('Version not found');
      }

      const versionData = versionDoc.data() as ContentVersion;

      // Unpublish previous published version
      const q = query(
        collection(this.firestore, 'content-versions'),
        where('contentId', '==', versionData.contentId),
        where('isPublishedVersion', '==', true)
      );
      
      const prevPublished = await getDocs(q);
      prevPublished.docs.forEach(doc => {
        transaction.update(doc.ref, { 
          isPublishedVersion: false,
          status: 'archived'
        });
      });

      // Publish current version
      transaction.update(versionRef, {
        isPublishedVersion: true,
        status: 'published',
        publishedAt: Timestamp.now()
      });
    }));
  }

  // Rollback to previous version
  rollbackToVersion(versionId: string): Observable<string> {
    return from(runTransaction(this.firestore, async (transaction) => {
      const versionRef = doc(this.firestore, 'content-versions', versionId);
      const versionDoc = await transaction.get(versionRef);
      
      if (!versionDoc.exists()) {
        throw new Error('Version not found');
      }

      const versionData = versionDoc.data() as ContentVersion;

      // Create new version based on the rollback target
      const rollbackVersion: Omit<ContentVersion, 'id'> = {
        ...versionData,
        versionNumber: versionData.versionNumber + 1,
        status: 'draft',
        createdAt: Timestamp.now(),
        isCurrentVersion: true,
        isPublishedVersion: false,
        changes: [{
          field: 'rollback',
          oldValue: null,
          newValue: `Rolled back to version ${versionData.versionNumber}`,
          changeType: 'update'
        }]
      };

      // Mark current version as not current
      const currentVersionQ = query(
        collection(this.firestore, 'content-versions'),
        where('contentId', '==', versionData.contentId),
        where('isCurrentVersion', '==', true)
      );
      
      const currentVersionDocs = await getDocs(currentVersionQ);
      currentVersionDocs.docs.forEach(doc => {
        transaction.update(doc.ref, { isCurrentVersion: false });
      });

      // Add rollback version
      const newVersionRef = doc(collection(this.firestore, 'content-versions'));
      transaction.set(newVersionRef, rollbackVersion);
      
      return newVersionRef.id;
    }));
  }

  // Compare two versions
  compareVersions(version1Id: string, version2Id: string): Observable<VersionComparison> {
    const version1$ = this.getVersionById(version1Id);
    const version2$ = this.getVersionById(version2Id);

    return forkJoin([version1$, version2$]).pipe(
      map(([v1, v2]) => this.generateComparison(v1!, v2!))
    );
  }

  private getVersionById(versionId: string): Observable<ContentVersion | null> {
    const docRef = doc(this.firestore, 'content-versions', versionId);
    return from(getDoc(docRef)).pipe(
      map(doc => {
        if (!doc.exists()) return null;
        return { id: doc.id, ...doc.data() } as ContentVersion;
      })
    );
  }

  private generateComparison(v1: ContentVersion, v2: ContentVersion): VersionComparison {
    const differences: FieldDifference[] = [];

    // Compare fields
    const fieldsToCompare = ['title', 'content', 'excerpt', 'featuredImage'];
    
    fieldsToCompare.forEach(field => {
      const value1 = (v1 as any)[field];
      const value2 = (v2 as any)[field];
      
      if (value1 !== value2) {
        differences.push({
          field,
          oldValue: value1,
          newValue: value2,
          changeType: this.getChangeType(value1, value2)
        });
      }
    });

    return {
      version1: v1,
      version2: v2,
      differences,
      hasChanges: differences.length > 0
    };
  }

  private getChangeType(oldValue: any, newValue: any): 'create' | 'update' | 'delete' {
    if (!oldValue && newValue) return 'create';
    if (oldValue && !newValue) return 'delete';
    return 'update';
  }
}

export interface VersionComparison {
  version1: ContentVersion;
  version2: ContentVersion;
  differences: FieldDifference[];
  hasChanges: boolean;
}

export interface FieldDifference {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'create' | 'update' | 'delete';
}
```

---

### 3. Preview Mode Components

#### Preview Banner Component

**src/app/shared/components/preview-banner/preview-banner.component.ts**
```typescript
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentVersion } from '@/core/models/content.model';
import { ContentVersioningService } from '@/core/services/content-versioning.service';

@Component({
  selector: 'app-preview-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preview-banner" [class.bg-warning]="version?.status === 'draft'"
         [class.bg-info]="version?.status === 'review'"
         [class.bg-success]="version?.status === 'published'">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <div class="d-flex align-items-center">
              <i class="bi bi-eye-fill me-2"></i>
              <strong>Preview Mode</strong>
              <span class="mx-2">|</span>
              <span>Version {{ version?.versionNumber }}</span>
              <span class="mx-2">|</span>
              <span class="badge" 
                [class.bg-secondary]="version?.status === 'draft'"
                [class.bg-primary]="version?.status === 'review'"
                [class.bg-success]="version?.status === 'published'">
                {{ version?.status | titlecase }}
              </span>
              @if (version?.scheduledFor) {
                <span class="mx-2">|</span>
                <small>Scheduled: {{ version.scheduledFor.toDate() | date:'short' }}</small>
              }
            </div>
          </div>
          <div class="col-md-4 text-end">
            <div class="btn-group btn-group-sm">
              @if (canPublish && version?.status !== 'published') {
                <button class="btn btn-light" (click)="publishVersion()">
                  <i class="bi bi-upload"></i> Publish
                </button>
              }
              <button class="btn btn-light" (click)="editVersion()">
                <i class="bi bi-pencil"></i> Edit
              </button>
              <button class="btn btn-light" (click)="viewHistory()">
                <i class="bi bi-clock-history"></i> History
              </button>
              <button class="btn btn-light" (click)="exitPreview()">
                <i class="bi bi-x"></i> Exit Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1050;
      padding: 0.75rem 0;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .preview-banner + * {
      margin-top: 60px;
    }

    .btn-light {
      background-color: rgba(255,255,255,0.2);
      border-color: rgba(255,255,255,0.3);
      color: white;
    }

    .btn-light:hover {
      background-color: rgba(255,255,255,0.3);
      border-color: rgba(255,255,255,0.4);
      color: white;
    }
  `]
})
export class PreviewBannerComponent {
  @Input() version: ContentVersion | null = null;
  @Input() canPublish = false;

  private versioningService = inject(ContentVersioningService);

  publishVersion() {
    if (!this.version?.id) return;

    if (confirm('Are you sure you want to publish this version?')) {
      this.versioningService.publishVersion(this.version.id).subscribe({
        next: () => {
          alert('Version published successfully!');
          location.reload(); // Refresh to show published state
        },
        error: (err) => {
          alert('Failed to publish: ' + err.message);
        }
      });
    }
  }

  editVersion() {
    if (!this.version) return;
    // Navigate to edit page
    window.location.href = `/admin/${this.version.contentType}s/edit/${this.version.contentId}`;
  }

  viewHistory() {
    if (!this.version) return;
    // Navigate to version history
    window.location.href = `/admin/${this.version.contentType}s/${this.version.contentId}/history`;
  }

  exitPreview() {
    // Return to normal view
    const currentUrl = window.location.href;
    const normalUrl = currentUrl.replace(/[?&]preview=\w+/, '');
    window.location.href = normalUrl;
  }
}
```

#### Version History Component

**src/app/admin/components/version-history/version-history.component.ts**
```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentVersioningService, VersionComparison } from '@/core/services/content-versioning.service';
import { ContentVersion } from '@/core/models/content.model';

@Component({
  selector: 'app-version-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Version History</h2>
        <a [routerLink]="['/admin', contentType, 'edit', contentId]" 
           class="btn btn-primary">
          <i class="bi bi-pencil"></i> Edit Current
        </a>
      </div>

      @if (loading()) {
        <div class="text-center">
          <div class="spinner-border" role="status"></div>
        </div>
      }

      @if (versions().length > 0) {
        <div class="row">
          <!-- Version List -->
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Versions</h5>
              </div>
              <div class="list-group list-group-flush">
                @for (version of versions(); track version.id) {
                  <div class="list-group-item" 
                       [class.active]="selectedVersion()?.id === version.id"
                       (click)="selectVersion(version)">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="mb-1">
                          Version {{ version.versionNumber }}
                          @if (version.isCurrentVersion) {
                            <span class="badge bg-primary ms-1">Current</span>
                          }
                          @if (version.isPublishedVersion) {
                            <span class="badge bg-success ms-1">Published</span>
                          }
                        </h6>
                        <p class="mb-1 text-truncate">{{ version.title }}</p>
                        <small class="text-muted">
                          {{ version.createdAt.toDate() | date:'short' }} 
                          by {{ version.author.name }}
                        </small>
                      </div>
                      <div class="btn-group-vertical btn-group-sm">
                        <button class="btn btn-outline-primary" 
                                (click)="previewVersion(version); $event.stopPropagation()">
                          <i class="bi bi-eye"></i>
                        </button>
                        @if (!version.isCurrentVersion) {
                          <button class="btn btn-outline-warning" 
                                  (click)="rollbackToVersion(version); $event.stopPropagation()">
                            <i class="bi bi-arrow-counterclockwise"></i>
                          </button>
                        }
                        @if (version.status !== 'published') {
                          <button class="btn btn-outline-success" 
                                  (click)="publishVersion(version); $event.stopPropagation()">
                            <i class="bi bi-upload"></i>
                          </button>
                        }
                      </div>
                    </div>
                    
                    @if (version.changes && version.changes.length > 0) {
                      <div class="mt-2">
                        <small class="text-muted">Changes:</small>
                        <ul class="list-unstyled mb-0">
                          @for (change of version.changes.slice(0, 3); track change.field) {
                            <li class="small text-muted">
                              {{ change.field }}: {{ change.changeType }}
                            </li>
                          }
                          @if (version.changes.length > 3) {
                            <li class="small text-muted">
                              +{{ version.changes.length - 3 }} more changes
                            </li>
                          }
                        </ul>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Version Details/Comparison -->
          <div class="col-md-6">
            @if (selectedVersion()) {
              <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">Version {{ selectedVersion()?.versionNumber }} Details</h5>
                  @if (versions().length > 1) {
                    <div class="dropdown">
                      <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                              data-bs-toggle="dropdown">
                        Compare with...
                      </button>
                      <ul class="dropdown-menu">
                        @for (version of versions(); track version.id) {
                          @if (version.id !== selectedVersion()?.id) {
                            <li>
                              <a class="dropdown-item" 
                                 (click)="compareWithVersion(version)">
                                Version {{ version.versionNumber }}
                              </a>
                            </li>
                          }
                        }
                      </ul>
                    </div>
                  }
                </div>
                <div class="card-body">
                  @if (comparison()) {
                    <!-- Version Comparison -->
                    <h6>Comparison: Version {{ comparison()?.version1.versionNumber }} 
                        vs {{ comparison()?.version2.versionNumber }}</h6>
                    
                    @if (comparison()?.differences && comparison()?.differences.length > 0) {
                      @for (diff of comparison()?.differences; track diff.field) {
                        <div class="mb-3 p-3 border rounded">
                          <strong>{{ diff.field | titlecase }}</strong>
                          <div class="row mt-2">
                            <div class="col-6">
                              <small class="text-muted">Before:</small>
                              <div class="p-2 bg-light border rounded">
                                {{ diff.oldValue || '(empty)' }}
                              </div>
                            </div>
                            <div class="col-6">
                              <small class="text-muted">After:</small>
                              <div class="p-2 bg-light border rounded">
                                {{ diff.newValue || '(empty)' }}
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                    } @else {
                      <p class="text-muted">No differences found between versions.</p>
                    }
                  } @else {
                    <!-- Single Version Details -->
                    <div class="mb-3">
                      <strong>Title:</strong>
                      <p>{{ selectedVersion()?.title }}</p>
                    </div>
                    
                    <div class="mb-3">
                      <strong>Status:</strong>
                      <span class="badge bg-secondary">{{ selectedVersion()?.status }}</span>
                    </div>

                    <div class="mb-3">
                      <strong>Author:</strong>
                      <p>{{ selectedVersion()?.author.name }} ({{ selectedVersion()?.author.email }})</p>
                    </div>

                    <div class="mb-3">
                      <strong>Created:</strong>
                      <p>{{ selectedVersion()?.createdAt.toDate() | date:'full' }}</p>
                    </div>

                    @if (selectedVersion()?.publishedAt) {
                      <div class="mb-3">
                        <strong>Published:</strong>
                        <p>{{ selectedVersion()?.publishedAt.toDate() | date:'full' }}</p>
                      </div>
                    }

                    <div class="mb-3">
                      <strong>Excerpt:</strong>
                      <p>{{ selectedVersion()?.excerpt || '(No excerpt)' }}</p>
                    </div>

                    <div class="mb-3">
                      <strong>Content Preview:</strong>
                      <div class="p-3 bg-light border rounded" style="max-height: 300px; overflow-y: auto;">
                        <div [innerHTML]="selectedVersion()?.content"></div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      } @else if (!loading()) {
        <div class="text-center">
          <p class="text-muted">No versions found for this content.</p>
        </div>
      }
    </div>
  `
})
export class VersionHistoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private versioningService = inject(ContentVersioningService);

  contentId!: string;
  contentType!: string;
  versions = signal<ContentVersion[]>([]);
  selectedVersion = signal<ContentVersion | null>(null);
  comparison = signal<VersionComparison | null>(null);
  loading = signal(false);

  ngOnInit() {
    this.contentId = this.route.snapshot.paramMap.get('id')!;
    this.contentType = this.route.snapshot.data['contentType'] || 'page';
    this.loadVersionHistory();
  }

  loadVersionHistory() {
    this.loading.set(true);
    this.versioningService.getVersionHistory(this.contentId).subscribe({
      next: (versions) => {
        this.versions.set(versions);
        if (versions.length > 0) {
          this.selectVersion(versions[0]); // Select latest version
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load version history:', err);
        this.loading.set(false);
      }
    });
  }

  selectVersion(version: ContentVersion) {
    this.selectedVersion.set(version);
    this.comparison.set(null); // Clear comparison when selecting single version
  }

  compareWithVersion(otherVersion: ContentVersion) {
    const currentVersion = this.selectedVersion();
    if (!currentVersion) return;

    this.versioningService.compareVersions(currentVersion.id, otherVersion.id).subscribe({
      next: (comparison) => {
        this.comparison.set(comparison);
      },
      error: (err) => {
        alert('Failed to compare versions: ' + err.message);
      }
    });
  }

  previewVersion(version: ContentVersion) {
    // Open preview in new tab
    const previewUrl = `/${this.contentType}s/${version.contentId}?preview=${version.id}`;
    window.open(previewUrl, '_blank');
  }

  publishVersion(version: ContentVersion) {
    if (!confirm(`Are you sure you want to publish version ${version.versionNumber}?`)) {
      return;
    }

    this.versioningService.publishVersion(version.id).subscribe({
      next: () => {
        alert('Version published successfully!');
        this.loadVersionHistory(); // Reload to update states
      },
      error: (err) => {
        alert('Failed to publish version: ' + err.message);
      }
    });
  }

  rollbackToVersion(version: ContentVersion) {
    if (!confirm(`Are you sure you want to rollback to version ${version.versionNumber}? This will create a new version.`)) {
      return;
    }

    this.versioningService.rollbackToVersion(version.id).subscribe({
      next: () => {
        alert('Successfully rolled back to version ' + version.versionNumber);
        this.loadVersionHistory(); // Reload to show new version
      },
      error: (err) => {
        alert('Failed to rollback: ' + err.message);
      }
    });
  }
}
```

---

## 🔨 Hands-On Exercise

### Exercise 1: Implement Content Scheduling
Add the ability to schedule content for future publication.

**Tasks:**
1. Add scheduling UI to content editor
2. Create background job to publish scheduled content
3. Add scheduled content dashboard
4. Implement scheduling notifications

### Exercise 2: Content Approval Workflow
Build a review and approval system for content.

**Tasks:**
1. Add "Submit for Review" status
2. Create reviewer role and permissions
3. Build approval/rejection workflow
4. Add comment system for reviewers

### Exercise 3: Auto-Save and Conflict Resolution
Implement auto-save functionality with conflict detection.

**Tasks:**
1. Auto-save draft every 30 seconds
2. Detect conflicts when multiple users edit
3. Show conflict resolution UI
4. Implement merge capabilities

---

## ✅ Testing Guidelines

### Unit Testing Version Service

```typescript
describe('ContentVersioningService', () => {
  let service: ContentVersioningService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContentVersioningService);
  });

  it('should create new version with incremented number', (done) => {
    const contentData = {
      title: 'Test Content',
      content: 'Test content body',
      status: 'draft'
    };

    service.createVersion('test-content-id', 'page', contentData, {
      uid: 'test-user',
      name: 'Test User',
      email: 'test@example.com'
    }).subscribe({
      next: (versionId) => {
        expect(versionId).toBeTruthy();
        done();
      }
    });
  });

  it('should rollback to previous version', (done) => {
    // Test rollback functionality
    // Mock version data and test rollback process
    done();
  });
});
```

---

## 📚 Resources

### Documentation
- [Firestore Transactions](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Angular Signals](https://angular.io/guide/signals)
- [Bootstrap Components](https://getbootstrap.com/docs/5.3/components/)

### Best Practices
- Use transactions for multi-document updates
- Implement optimistic UI updates
- Add proper error handling and rollback
- Consider performance with large version histories

---

## 🎯 Daily Checklist

- [ ] Design content versioning data model
- [ ] Implement ContentVersioningService with CRUD operations
- [ ] Create version history component with comparison
- [ ] Build preview banner component
- [ ] Add rollback functionality
- [ ] Implement publish/unpublish workflow
- [ ] Add content scheduling (stretch goal)
- [ ] Test version creation and rollback
- [ ] Implement conflict detection
- [ ] Commit with message: "feat(cms): implement preview mode and versioning system"

---

**Next**: [Day 6 - Public-Facing Pages →](../Day-06-Public-Pages/README.md)

**Previous**: [← Day 4 - WYSIWYG Editor Integration](../Day-04-WYSIWYG-Editor/README.md)