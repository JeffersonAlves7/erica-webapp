import { Test, TestingModule } from '@nestjs/testing';
import { EmbarquesController } from './embarques.controller';

describe('EmbarquesController', () => {
  let controller: EmbarquesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmbarquesController],
    }).compile();

    controller = module.get<EmbarquesController>(EmbarquesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
