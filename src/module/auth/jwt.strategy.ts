import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JWT_PUBLIC_KEY } from '@constant/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_PUBLIC_KEY(),
      algorithms: ['RS256'],
      audience: ['customer', 'bank-user', 'admin', 'corp'],
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
