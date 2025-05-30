import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDocumentoComponent } from './upload-documento.component';

describe('UploadDocumentoComponent', () => {
  let component: UploadDocumentoComponent;
  let fixture: ComponentFixture<UploadDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadDocumentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
