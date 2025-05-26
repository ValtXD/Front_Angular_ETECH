import { TestBed } from '@angular/core/testing';

import { OcrContadorQrService } from './ocr-contador-qr.service';

describe('OcrContadorQrService', () => {
  let service: OcrContadorQrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OcrContadorQrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
