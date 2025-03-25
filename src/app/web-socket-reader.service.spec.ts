import { TestBed } from '@angular/core/testing';

import { WebSocketReaderService } from './web-socket-reader.service';

describe('WebSocketReaderService', () => {
  let service: WebSocketReaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebSocketReaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
