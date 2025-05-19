import { TestBed } from '@angular/core/testing';

import { ContadorEnergiaService } from './contador-energia.service';

describe('ContadorEnergiaService', () => {
  let service: ContadorEnergiaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContadorEnergiaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
