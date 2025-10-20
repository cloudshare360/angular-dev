````markdown
# Day 3: Reactive Forms Fundamentals

**Duration**: 3 hours  
**Goal**: Build reactive forms with validation for employee data entry.

---

## 🎯 Learning Objectives

- Create FormControl, FormGroup, FormArray
- Add built-in and custom validators
- Display validation errors in templates
- Handle form submission

---

## 📝 Topics Covered

### 1. Reactive Forms Setup (30 minutes)

#### Import ReactiveFormsModule
```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.component.html'
})
export class EmployeeFormComponent {}
```

### 2. Build Form with FormBuilder (45 minutes)

```typescript
import { inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class EmployeeFormComponent {
  private fb = inject(FormBuilder);
  
  employeeForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.pattern(/^\d{10}$/)],
    department: ['', Validators.required],
    hireDate: ['', Validators.required]
  });
  
  onSubmit() {
    if (this.employeeForm.valid) {
      console.log(this.employeeForm.value);
    }
  }
}
```

### 3. Template & Validation Display (45 minutes)

```html
<form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
  <div>
    <label>First Name</label>
    <input formControlName="firstName" />
    <div *ngIf="employeeForm.get('firstName')?.invalid && employeeForm.get('firstName')?.touched">
      <small *ngIf="employeeForm.get('firstName')?.errors?.['required']">Required</small>
      <small *ngIf="employeeForm.get('firstName')?.errors?.['minlength']">Min 2 chars</small>
    </div>
  </div>
  
  <button type="submit" [disabled]="employeeForm.invalid">Save</button>
</form>
```

### 4. Custom Validators (30 minutes)

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const inputDate = new Date(value);
    const today = new Date();
    return inputDate > today ? { futureDate: true } : null;
  };
}

// Usage:
hireDate: ['', [Validators.required, futureDateValidator()]]
```

### 5. FormArray for Dynamic Fields (30 minutes)

```typescript
import { FormArray } from '@angular/forms';

skills: FormArray = this.fb.array([]);

addSkill() {
  this.skills.push(this.fb.control('', Validators.required));
}

removeSkill(index: number) {
  this.skills.removeAt(index);
}
```

---

## 🏋️ Practice Exercises

1. Create a complete employee form with all fields and validation.
2. Add a custom validator to ensure email is from company domain.
3. Implement FormArray for skills or certifications.

---

## 📚 Resources

- [Reactive Forms Guide](https://angular.dev/guide/forms/reactive-forms)
- [Form Validation](https://angular.dev/guide/forms/form-validation)

---

## ✅ End of Day Checklist

- [ ] Employee form created with validation
- [ ] Validation errors displayed in UI
- [ ] Custom validator implemented
- [ ] Form submission handling working
- [ ] Commit changes

````