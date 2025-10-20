````markdown
# Day 7: Testing Forms & Services

**Duration**: 3 hours  
**Goal**: Write comprehensive unit tests for reactive forms and services.

---

## 🎯 Learning Objectives

- Test reactive forms with validation
- Mock services and HTTP calls
- Test component-service integration
- Achieve meaningful test coverage

---

## 📝 Topics Covered

### 1. Testing Reactive Forms (60 minutes)

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeeFormComponent } from './employee-form.component';

describe('EmployeeFormComponent', () => {
  let component: EmployeeFormComponent;
  let fixture: ComponentFixture<EmployeeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeFormComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create form with default values', () => {
    expect(component.employeeForm).toBeDefined();
    expect(component.employeeForm.get('firstName')?.value).toBe('');
  });

  it('should invalidate form when firstName is empty', () => {
    const firstNameControl = component.employeeForm.get('firstName');
    firstNameControl?.setValue('');
    expect(firstNameControl?.hasError('required')).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.employeeForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);
    
    emailControl?.setValue('valid@example.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should enable submit button when form is valid', () => {
    component.employeeForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      department: 'IT',
      hireDate: '2024-01-01'
    });
    
    expect(component.employeeForm.valid).toBe(true);
  });
});
```

### 2. Testing Services (45 minutes)

```typescript
import { TestBed } from '@angular/core/testing';
import { EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeService);
  });

  it('should add employee', () => {
    const newEmployee = {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      department: 'HR'
    };
    
    service.addEmployee(newEmployee);
    const employees = service.getEmployees()();
    
    expect(employees).toContain(newEmployee);
    expect(employees.length).toBe(2);
  });

  it('should delete employee', () => {
    service.deleteEmployee(1);
    const employees = service.getEmployees()();
    
    expect(employees.find(e => e.id === 1)).toBeUndefined();
  });
});
```

### 3. Testing HTTP Calls (45 minutes)

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeApiService } from './employee-api.service';

describe('EmployeeApiService', () => {
  let service: EmployeeApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmployeeApiService]
    });
    
    service = TestBed.inject(EmployeeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch employees', () => {
    const mockEmployees = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', department: 'IT' }
    ];

    service.getEmployees().subscribe(employees => {
      expect(employees.length).toBe(1);
      expect(employees).toEqual(mockEmployees);
    });

    const req = httpMock.expectOne('http://localhost:3000/employees');
    expect(req.request.method).toBe('GET');
    req.flush(mockEmployees);
  });

  it('should handle error when fetching fails', () => {
    service.getEmployees().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/employees');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
```

### 4. Component Integration Tests (30 minutes)

```typescript
it('should display employees from service', () => {
  const mockEmployees = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', department: 'IT' }
  ];
  
  spyOn(component['employeeService'], 'getEmployees').and.returnValue(signal(mockEmployees));
  
  fixture.detectChanges();
  
  const compiled = fixture.nativeElement;
  expect(compiled.textContent).toContain('John Doe');
});
```

---

## 🏋️ Practice Exercises

1. Write tests for custom form validators.
2. Test route guard behavior (allow/deny navigation).
3. Test component that combines multiple services.
4. Achieve >80% code coverage for employee module.

---

## 📚 Resources

- [Testing Guide](https://angular.dev/guide/testing)
- [HttpClientTestingModule](https://angular.dev/api/common/http/testing/HttpClientTestingModule)

---

## ✅ End of Day Checklist

- [ ] 5+ unit tests for forms written
- [ ] Service tests with mocked dependencies
- [ ] HTTP call tests with HttpTestingController
- [ ] Integration tests passing
- [ ] Coverage report generated
- [ ] Commit changes

---

## 🎉 Week 2 Complete!

You now have a fully functional Employee Management System with:
- ✅ Routing and navigation
- ✅ Route guards and lazy loading
- ✅ Reactive forms with validation
- ✅ Services and state management
- ✅ HTTP integration
- ✅ Comprehensive tests

**Next Week**: Build a Shopping Cart with advanced patterns!

````