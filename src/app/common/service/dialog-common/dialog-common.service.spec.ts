import { TestBed } from '@angular/core/testing';

import { DialogCommonService } from './dialog-common.service';

describe('DialogCommonService', () => {
  let service: DialogCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
