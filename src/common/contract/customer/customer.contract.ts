import { CustomerDTO } from './customer.entity';

export abstract class CustomerContract {
  abstract GetCustomerById(customer_id: string): Promise<CustomerDTO>;
}
