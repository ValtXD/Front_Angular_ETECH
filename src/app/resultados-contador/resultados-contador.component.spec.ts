import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadosContadorComponent } from './resultados-contador.component';

describe('ResultadosContadorComponent', () => {
  let component: ResultadosContadorComponent;
  let fixture: ComponentFixture<ResultadosContadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadosContadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadosContadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
