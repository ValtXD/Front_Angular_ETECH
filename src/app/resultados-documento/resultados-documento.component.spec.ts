import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadosDocumentoComponent } from './resultados-documento.component';

describe('ResultadosDocumentoComponent', () => {
  let component: ResultadosDocumentoComponent;
  let fixture: ComponentFixture<ResultadosDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadosDocumentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadosDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
