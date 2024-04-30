import {
  ACCOUNT_REPOSITORY,
  CUSTOMER_REPOSITORY,
  PAYMENT_REPOSITORY,
} from '@adapter/miroservice/constant/provider';
import { CustomerEntity } from '@adapter/miroservice/customer/entity/customer.entity';
import { PaymentEntity } from '@adapter/miroservice/payment/entity/inter-payment.entity';
import {
  DATABASE_CONNECTION,
  STEPUP_SESSION_REPOSITORY,
  USER_LOGIN_REPOSITORY,
} from '@constant/provider';
import { UserLoginEntity } from '@module/auth/entity/user-login.entity';
import { Connection } from 'typeorm';
import { StepupSessionEntity } from './entity/stepup-session.entity';

export const stepupAuthenticationProvider = [
  {
    provide: USER_LOGIN_REPOSITORY,
    useFactory: (connection: Connection) =>
      connection.getRepository(UserLoginEntity),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: STEPUP_SESSION_REPOSITORY,
    useFactory: (connection: Connection) =>
      connection.getRepository(StepupSessionEntity),
    inject: [DATABASE_CONNECTION],
  },
];
