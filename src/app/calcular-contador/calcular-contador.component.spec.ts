import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalcularContadorComponent } from './calcular-contador.component';

describe('CalcularContadorComponent', () => {
  let component: CalcularContadorComponent;
  let fixture: ComponentFixture<CalcularContadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalcularContadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalcularContadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
