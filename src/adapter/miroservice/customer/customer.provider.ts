import { DATABASE_CONNECTION } from '@constant/provider';
import { Connection } from 'typeorm';
import { CUSTOMER_REPOSITORY } from '../constant/provider';
import { CustomerEntity } from './entity/customer.entity';

export const customerProviders = [
  {
    provide: CUSTOMER_REPOSITORY,
    useFactory: (connection: Connection) =>
      connection.getRepository(CustomerEntity),
    inject: [DATABASE_CONNECTION],
  },
];
