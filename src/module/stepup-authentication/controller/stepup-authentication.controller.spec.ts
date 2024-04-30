import { Test, TestingModule } from '@nestjs/testing';
import { StepupAuthenticationService } from '../service/stepup-authentication.service';
import { StepupAuthenticationController } from './stepup-authentication.controller';

describe('StepupAuthenticationController', () => {
  let controller: StepupAuthenticationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StepupAuthenticationController],
      providers: [StepupAuthenticationService],
    }).compile();

    controller = module.get<StepupAuthenticationController>(
      StepupAuthenticationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
