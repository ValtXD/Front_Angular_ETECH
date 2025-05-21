import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumoMensalListarComponent } from './consumo-mensal-listar.component';

describe('ConsumoMensalListarComponent', () => {
  let component: ConsumoMensalListarComponent;
  let fixture: ComponentFixture<ConsumoMensalListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsumoMensalListarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumoMensalListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
