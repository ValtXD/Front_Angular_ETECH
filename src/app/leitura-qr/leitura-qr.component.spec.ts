import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeituraQrComponent } from './leitura-qr.component';

describe('LeituraQrComponent', () => {
  let component: LeituraQrComponent;
  let fixture: ComponentFixture<LeituraQrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeituraQrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeituraQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
