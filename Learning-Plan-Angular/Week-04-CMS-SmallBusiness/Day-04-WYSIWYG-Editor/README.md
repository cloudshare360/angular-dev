# Week 4, Day 4: WYSIWYG Editor Integration

## 📋 Objectives
By the end of Day 4, you will:
- ✅ Integrate a rich text editor (TinyMCE or Quill) into Angular
- ✅ Configure editor with custom toolbar and plugins
- ✅ Implement image upload and management
- ✅ Handle content sanitization and security
- ✅ Create reusable editor component
- ✅ Save and retrieve formatted content from Firestore

---

## 📚 Topics Covered

### 1. Choosing a Rich Text Editor

#### Popular Options

| Editor | Pros | Cons | Best For |
|--------|------|------|----------|
| **TinyMCE** | Full-featured, mature, great docs | Larger bundle size | Complex CMS needs |
| **Quill** | Lightweight, modern, modular | Fewer built-in features | Simple blogs |
| **CKEditor** | Enterprise-grade, highly customizable | Commercial license for advanced features | Corporate CMSs |
| **ngx-quill** | Angular wrapper for Quill | Depends on Quill updates | Angular projects |

**For this project, we'll use ngx-quill** (lightweight and Angular-friendly).

---

### 2. Installing and Setting Up ngx-quill

#### Installation

```bash
# Install ngx-quill and quill
npm install ngx-quill quill@^2.0.0

# Install types
npm install --save-dev @types/quill
```

#### Import Quill Styles

**angular.json**
```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "src/styles.scss",
              "node_modules/quill/dist/quill.snow.css"
            ]
          }
        }
      }
    }
  }
}
```

---

### 3. Creating Reusable Editor Component

#### Rich Text Editor Component

**src/app/shared/components/rich-editor/rich-editor.component.ts**
```typescript
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { QuillModule, QuillConfiguration } from 'ngx-quill';

@Component({
  selector: 'app-rich-editor',
  standalone: true,
  imports: [CommonModule, QuillModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichEditorComponent),
      multi: true
    }
  ],
  template: `
    <div class="rich-editor-wrapper">
      <quill-editor
        [modules]="editorModules"
        [styles]="editorStyles"
        [placeholder]="placeholder"
        [(ngModel)]="value"
        (onContentChanged)="onContentChange($event)"
        (onBlur)="onTouched()">
      </quill-editor>
      
      @if (showCharCount) {
        <div class="char-count text-muted small mt-2">
          Characters: {{ characterCount }} / {{ maxLength }}
        </div>
      }
    </div>
  `,
  styles: [`
    .rich-editor-wrapper {
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      overflow: hidden;
    }

    ::ng-deep .ql-toolbar {
      border: none;
      border-bottom: 1px solid #dee2e6;
      background-color: #f8f9fa;
    }

    ::ng-deep .ql-container {
      border: none;
      min-height: 300px;
      font-size: 16px;
    }

    ::ng-deep .ql-editor {
      min-height: 300px;
    }

    ::ng-deep .ql-editor.ql-blank::before {
      font-style: normal;
      color: #6c757d;
    }

    .char-count {
      padding: 0.5rem 1rem;
      background-color: #f8f9fa;
      border-top: 1px solid #dee2e6;
    }
  `]
})
export class RichEditorComponent implements ControlValueAccessor {
  @Input() placeholder = 'Enter content...';
  @Input() showCharCount = false;
  @Input() maxLength = 10000;
  @Output() contentChange = new EventEmitter<string>();

  value = '';
  characterCount = 0;

  // Quill configuration
  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  };

  editorStyles = {
    height: '300px'
  };

  // ControlValueAccessor implementation
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value || '';
    this.updateCharCount();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onContentChange(event: any): void {
    this.value = event.html || '';
    this.updateCharCount();
    this.onChange(this.value);
    this.contentChange.emit(this.value);
  }

  updateCharCount(): void {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.value;
    this.characterCount = tempDiv.textContent?.length || 0;
  }
}
```

---

### 4. Image Upload Integration

#### Image Upload Service

**src/app/core/services/image-upload.service.ts**
```typescript
import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable, from, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private storage = inject(Storage);

  uploadImage(file: File, path: string = 'images'): Observable<string> {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `${path}/${fileName}`;
    const storageRef = ref(this.storage, filePath);

    return from(uploadBytes(storageRef, file)).pipe(
      switchMap(() => getDownloadURL(storageRef))
    );
  }

  uploadMultipleImages(files: File[], path: string = 'images'): Observable<string[]> {
    const uploads = files.map(file => this.uploadImage(file, path));
    return forkJoin(uploads);
  }
}
```

#### Custom Image Handler for Quill

**src/app/shared/components/rich-editor/rich-editor-with-upload.component.ts**
```typescript
import { Component, inject, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuillModule, QuillEditorComponent } from 'ngx-quill';
import { ImageUploadService } from '@/core/services/image-upload.service';
import Quill from 'quill';

@Component({
  selector: 'app-rich-editor-with-upload',
  standalone: true,
  imports: [CommonModule, QuillModule],
  template: `
    <div class="editor-container">
      <quill-editor
        #editor
        [modules]="editorModules"
        [(ngModel)]="content"
        (onEditorCreated)="onEditorCreated($event)">
      </quill-editor>
      
      <input
        #imageInput
        type="file"
        accept="image/*"
        style="display: none"
        (change)="handleImageUpload($event)">
    </div>
  `,
  styles: [`
    .editor-container {
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
    }

    ::ng-deep .ql-container {
      min-height: 400px;
      font-size: 16px;
    }

    ::ng-deep .ql-editor img {
      max-width: 100%;
      height: auto;
      cursor: pointer;
    }
  `]
})
export class RichEditorWithUploadComponent implements AfterViewInit {
  @ViewChild('editor') editor!: QuillEditorComponent;
  @ViewChild('imageInput') imageInput!: any;

  private imageUploadService = inject(ImageUploadService);
  
  content = '';
  quillInstance: any;

  editorModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: () => this.imageHandler()
      }
    }
  };

  ngAfterViewInit() {
    // Quill instance will be available after view init
  }

  onEditorCreated(quill: any) {
    this.quillInstance = quill;
  }

  imageHandler() {
    // Trigger file input click
    this.imageInput.nativeElement.click();
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should not exceed 5MB');
      return;
    }

    // Show loading state
    const range = this.quillInstance.getSelection(true);
    this.quillInstance.insertText(range.index, 'Uploading image...');

    // Upload to Firebase Storage
    this.imageUploadService.uploadImage(file, 'content-images').subscribe({
      next: (url) => {
        // Remove loading text
        this.quillInstance.deleteText(range.index, 'Uploading image...'.length);
        
        // Insert image
        this.quillInstance.insertEmbed(range.index, 'image', url);
        
        // Move cursor after image
        this.quillInstance.setSelection(range.index + 1);
      },
      error: (err) => {
        // Remove loading text
        this.quillInstance.deleteText(range.index, 'Uploading image...'.length);
        alert('Failed to upload image: ' + err.message);
      }
    });

    // Reset file input
    event.target.value = '';
  }
}
```

---

### 5. Content Sanitization

#### HTML Sanitizer Service

**src/app/core/services/html-sanitizer.service.ts**
```typescript
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class HtmlSanitizerService {
  constructor(private sanitizer: DomSanitizer) {}

  sanitize(html: string): SafeHtml {
    return this.sanitizer.sanitize(1, html) || '';
  }

  sanitizeAndBypass(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  stripTags(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  extractExcerpt(html: string, maxLength: number = 160): string {
    const text = this.stripTags(html);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }
}
```

---

### 6. Using Editor in Content Forms

#### Updated Content Editor with Rich Text

**src/app/admin/components/page-editor/page-editor.component.ts**
```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PagesService } from '@/core/services/pages.service';
import { RichEditorWithUploadComponent } from '@/shared/components/rich-editor/rich-editor-with-upload.component';
import { HtmlSanitizerService } from '@/core/services/html-sanitizer.service';

@Component({
  selector: 'app-page-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RichEditorWithUploadComponent
  ],
  template: `
    <div class="container mt-4">
      <h2>{{ isEditMode() ? 'Edit Page' : 'New Page' }}</h2>

      <form [formGroup]="pageForm" (ngSubmit)="onSubmit()">
        <!-- Title -->
        <div class="mb-3">
          <label class="form-label">Title *</label>
          <input type="text" class="form-control" formControlName="title"
                 (blur)="generateSlug()">
        </div>

        <!-- Slug -->
        <div class="mb-3">
          <label class="form-label">Slug *</label>
          <div class="input-group">
            <span class="input-group-text">/</span>
            <input type="text" class="form-control" formControlName="slug">
          </div>
        </div>

        <!-- Featured Image -->
        <div class="mb-3">
          <label class="form-label">Featured Image URL</label>
          <input type="url" class="form-control" 
                 formControlName="featuredImage">
          @if (pageForm.get('featuredImage')?.value) {
            <img [src]="pageForm.get('featuredImage')?.value" 
                 class="mt-2 img-thumbnail" 
                 style="max-width: 300px">
          }
        </div>

        <!-- Excerpt -->
        <div class="mb-3">
          <label class="form-label">Excerpt</label>
          <textarea class="form-control" rows="2" 
                    formControlName="excerpt"
                    placeholder="Brief summary of the page"></textarea>
          <small class="text-muted">
            Auto-generated from content if left empty
          </small>
        </div>

        <!-- Rich Text Content -->
        <div class="mb-3">
          <label class="form-label">Content *</label>
          <app-rich-editor-with-upload
            formControlName="content">
          </app-rich-editor-with-upload>
        </div>

        <!-- SEO Section -->
        <div class="card mb-3">
          <div class="card-header">
            <h5 class="mb-0">SEO Settings</h5>
          </div>
          <div class="card-body" formGroupName="seo">
            <div class="mb-3">
              <label class="form-label">Meta Title</label>
              <input type="text" class="form-control" 
                     formControlName="metaTitle"
                     maxlength="60">
              <small class="text-muted">
                Recommended: 50-60 characters
              </small>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Meta Description</label>
              <textarea class="form-control" rows="2" 
                        formControlName="metaDescription"
                        maxlength="160"></textarea>
              <small class="text-muted">
                Recommended: 150-160 characters
              </small>
            </div>

            <div class="mb-3">
              <label class="form-label">Keywords (comma-separated)</label>
              <input type="text" class="form-control" 
                     placeholder="angular, cms, firebase">
            </div>
          </div>
        </div>

        <!-- Status and Author -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Status</label>
            <select class="form-select" formControlName="status">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Author</label>
            <input type="text" class="form-control" 
                   formControlName="author" readonly>
          </div>
        </div>

        <!-- Preview Section -->
        @if (showPreview()) {
          <div class="card mb-3">
            <div class="card-header d-flex justify-content-between">
              <h5 class="mb-0">Preview</h5>
              <button type="button" class="btn-close" 
                      (click)="togglePreview()"></button>
            </div>
            <div class="card-body">
              <h1>{{ pageForm.get('title')?.value }}</h1>
              <div class="text-muted mb-3">
                By {{ pageForm.get('author')?.value }}
              </div>
              <div [innerHTML]="sanitizeHtml(pageForm.get('content')?.value)">
              </div>
            </div>
          </div>
        }

        <!-- Actions -->
        <div class="d-flex gap-2 mb-5">
          <button type="submit" class="btn btn-primary" 
                  [disabled]="pageForm.invalid || saving()">
            {{ saving() ? 'Saving...' : 'Save Page' }}
          </button>
          <button type="button" class="btn btn-outline-secondary" 
                  (click)="togglePreview()">
            {{ showPreview() ? 'Hide' : 'Show' }} Preview
          </button>
          <button type="button" class="btn btn-outline-secondary" 
                  (click)="saveDraft()" [disabled]="saving()">
            Save as Draft
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
export class PageEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pagesService = inject(PagesService);
  private htmlSanitizer = inject(HtmlSanitizerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  saving = signal(false);
  showPreview = signal(false);
  pageId: string | null = null;

  pageForm = this.fb.group({
    title: ['', Validators.required],
    slug: ['', Validators.required],
    featuredImage: [''],
    excerpt: [''],
    content: ['', Validators.required],
    seo: this.fb.group({
      metaTitle: [''],
      metaDescription: [''],
      keywords: [[]]
    }),
    status: ['draft'],
    author: ['']
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
        if (page) this.pageForm.patchValue(page);
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

  togglePreview() {
    this.showPreview.update(v => !v);
  }

  sanitizeHtml(html: string): any {
    return this.htmlSanitizer.sanitizeAndBypass(html);
  }

  saveDraft() {
    this.pageForm.patchValue({ status: 'draft' });
    this.onSubmit();
  }

  onSubmit() {
    if (this.pageForm.invalid) return;

    this.saving.set(true);
    const formValue = this.pageForm.value;

    // Auto-generate excerpt if empty
    if (!formValue.excerpt && formValue.content) {
      formValue.excerpt = this.htmlSanitizer.extractExcerpt(formValue.content);
    }

    const operation = this.isEditMode() && this.pageId
      ? this.pagesService.update(this.pageId, formValue)
      : this.pagesService.create(formValue);

    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/pages']);
      },
      error: (err) => {
        this.saving.set(false);
        alert('Failed to save: ' + err.message);
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

### Exercise 1: Add TinyMCE Alternative
Implement TinyMCE as an alternative editor option.

**Tasks:**
1. Install TinyMCE packages
2. Create TinyMCE wrapper component
3. Add editor switching functionality
4. Compare bundle sizes

### Exercise 2: Advanced Image Management
Create an image gallery and media library.

**Tasks:**
1. Build image gallery component
2. Implement drag-and-drop upload
3. Add image cropping/resizing
4. Create media browser for editor

### Exercise 3: Content Templates
Implement reusable content templates.

**Tasks:**
1. Create template schema
2. Build template library UI
3. Allow inserting templates into editor
4. Save custom templates

---

## ✅ Testing Guidelines

### Unit Testing Editor Component

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RichEditorComponent } from './rich-editor.component';

describe('RichEditorComponent', () => {
  let component: RichEditorComponent;
  let fixture: ComponentFixture<RichEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RichEditorComponent);
    component = fixture.componentInstance;
  });

  it('should update character count on content change', () => {
    component.writeValue('<p>Test content</p>');
    expect(component.characterCount).toBe(12);
  });

  it('should sanitize HTML content', () => {
    const maliciousContent = '<script>alert("xss")</script><p>Safe</p>';
    component.writeValue(maliciousContent);
    // Verify script tags are removed
  });
});
```

---

## 📚 Resources

### Official Documentation
- [ngx-quill](https://github.com/KillerCodeMonkey/ngx-quill)
- [Quill.js](https://quilljs.com/)
- [TinyMCE](https://www.tiny.cloud/)
- [Firebase Storage](https://firebase.google.com/docs/storage)

### Security
- [Angular Security Guide](https://angular.io/guide/security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## 🎯 Daily Checklist

- [ ] Install ngx-quill and dependencies
- [ ] Create reusable rich text editor component
- [ ] Implement ControlValueAccessor for forms integration
- [ ] Add image upload functionality with Firebase Storage
- [ ] Implement custom image handler for Quill
- [ ] Add content sanitization service
- [ ] Update page editor with rich text component
- [ ] Add preview functionality
- [ ] Test image uploads and content saving
- [ ] Commit with message: "feat(cms): integrate WYSIWYG editor with image upload"

---

**Next**: [Day 5 - Preview Mode & Versioning →](../Day-05-Preview-Versioning/README.md)

**Previous**: [← Day 3 - Content Models & Firestore](../Day-03-Content-Models-Firestore/README.md)
