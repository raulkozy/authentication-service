import { JwtAuthGuard } from '@module/auth/jwt-auth.guard';
import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StepupHeadrs, StepupRequestQueryDTO } from '../model/dto/stepup.dto';
import { StepupAuthenticationService } from '../service/stepup-authentication.service';

@ApiTags('Stepup Authentication')
@ApiBearerAuth('Authorization')
@Controller('stepup-authentication')
export class StepupAuthenticationController {
  constructor(
    private readonly stepupAuthenticationService: StepupAuthenticationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  check(
    @Headers() headers: StepupHeadrs,
    @Query() query: StepupRequestQueryDTO,
  ) {
    const { CUSTOMER_ID, CHANNEL } = headers;
    return this.stepupAuthenticationService.stepupAuthenticationCheck(
      CUSTOMER_ID,
      CHANNEL,
      {
        ...query,
        action: headers.ACTION,
        session: headers.SESSION,
        veridium_session: headers.VERIDIUM_SESSION,
        verification_method: headers.VERIFICATION_METHOD,
        otp: headers.OTP,
      },
      headers,
    );
  }
}
