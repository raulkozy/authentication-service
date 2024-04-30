import { Test, TestingModule } from '@nestjs/testing';
import { StepupAuthenticationService } from './stepup-authentication.service';

describe('StepupAuthenticationService', () => {
  let service: StepupAuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StepupAuthenticationService],
    }).compile();

    service = module.get<StepupAuthenticationService>(
      StepupAuthenticationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
