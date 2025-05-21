import { TestBed } from '@angular/core/testing';

import { OcrContadorService } from './ocr-contador.service';

describe('OcrContadorService', () => {
  let service: OcrContadorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OcrContadorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
