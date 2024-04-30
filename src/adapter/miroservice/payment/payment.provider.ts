import { DATABASE_CONNECTION } from '@constant/provider';
import { Connection } from 'typeorm';
import { PAYMENT_REPOSITORY } from '../constant/provider';
import { PaymentEntity } from './entity/inter-payment.entity';

export const paymentProviders = [
  {
    provide: PAYMENT_REPOSITORY,
    useFactory: (connection: Connection) =>
      connection.getRepository(PaymentEntity),
    inject: [DATABASE_CONNECTION],
  },
];
