import {
  USER_LOGIN_REPOSITORY,
  DATABASE_CONNECTION,
  REFRESH_TOKEN_REPOSITORY,
} from '@constant/provider';
import { Connection } from 'typeorm';
import { UserLoginEntity } from './entity/user-login.entity';
import { RefreshTokenEntity } from './entity/refresh-token.entity';

export const authProviders = [
  {
    provide: REFRESH_TOKEN_REPOSITORY,
    useFactory: (connection: Connection) =>
      connection.getRepository(RefreshTokenEntity),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: USER_LOGIN_REPOSITORY,
    useFactory: (connection: Connection) =>
      connection.getRepository(UserLoginEntity),
    inject: [DATABASE_CONNECTION],
  },
];
