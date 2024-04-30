import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { authProviders } from './auth.provider';
import { DatabaseModule } from '@config/database/db.module';
import { PassportModule } from '@nestjs/passport';
import { AxiosModule } from '@module/http/http.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceModule } from 'src/adapter/miroservice/microservice.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const options: JwtModuleOptions = {
          privateKey: configService
            .get('JWT_PRIVATE_KEY')
            .replace(/\\n/g, '\n'),
          publicKey: configService.get('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
          signOptions: {
            issuer: configService.get('JWT_ISS'),
            algorithm: 'RS256',
          },
        };
        return options;
      },
      inject: [ConfigService],
    }),
    AxiosModule,
    MicroserviceModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtModule, JwtStrategy, ...authProviders],
})
export class AuthModule {}
