import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './module/auth/auth.module';
import config from './config/config';
import { HealthController } from '@module/http/health.controller';
import { VeridiumModule } from '@module/veridium/veridium.module';
import { StepupAuthenticationModule } from '@module/stepup-authentication/stepup-authentication.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      cache: true,
      isGlobal: true,
    }),
    AuthModule,
    VeridiumModule,
    StepupAuthenticationModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
