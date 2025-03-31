import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishRecipeComponent } from './dish-recipe.component';

describe('DishRecipeComponent', () => {
  let component: DishRecipeComponent;
  let fixture: ComponentFixture<DishRecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishRecipeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
