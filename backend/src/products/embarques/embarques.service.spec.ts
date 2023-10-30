import { Test, TestingModule } from '@nestjs/testing';
import { EmbarquesService } from './embarques.service';

describe('EmbarquesService', () => {
  let service: EmbarquesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmbarquesService],
    }).compile();

    service = module.get<EmbarquesService>(EmbarquesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
