import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumoMensalCalcularComponent } from './consumo-mensal-calcular.component';

describe('ConsumoMensalCalcularComponent', () => {
  let component: ConsumoMensalCalcularComponent;
  let fixture: ComponentFixture<ConsumoMensalCalcularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsumoMensalCalcularComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumoMensalCalcularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
