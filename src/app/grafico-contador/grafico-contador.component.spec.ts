import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoContadorComponent } from './grafico-contador.component';

describe('GraficoContadorComponent', () => {
  let component: GraficoContadorComponent;
  let fixture: ComponentFixture<GraficoContadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoContadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoContadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
