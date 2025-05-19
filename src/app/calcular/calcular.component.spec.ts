import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalcularComponent } from './calcular.component';

describe('CalcularComponent', () => {
  let component: CalcularComponent;
  let fixture: ComponentFixture<CalcularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalcularComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalcularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
