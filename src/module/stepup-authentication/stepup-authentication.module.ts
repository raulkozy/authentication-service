import { MicroserviceModule } from '@adapter/miroservice/microservice.module';
import { DatabaseModule } from '@config/database/db.module';
import { AxiosModule } from '@module/http/http.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { StepupAuthenticationController } from './controller/stepup-authentication.controller';
import { StepupAuthenticationService } from './service/stepup-authentication.service';
import { stepupAuthenticationProvider } from './stepup-authentication.provider';

@Module({
  imports: [
    DatabaseModule,
    AxiosModule,
    JwtModule.register({}),
    MicroserviceModule,
  ],
  controllers: [StepupAuthenticationController],
  providers: [StepupAuthenticationService, ...stepupAuthenticationProvider],
  exports: [StepupAuthenticationService],
})
export class StepupAuthenticationModule {}
