import { CUSTOMER_REPOSITORY } from '@adapter/miroservice/constant/provider';
import { CustomerContract } from '@common/contract/customer/customer.contract';
import { CustomerDTO } from '@common/contract/customer/customer.entity';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../entity/customer.entity';
@Injectable()
export class customerService implements CustomerContract {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly _customerRepository: Repository<CustomerEntity>,
  ) {}
  async GetCustomerById(customer_id: string): Promise<CustomerDTO | null> {
    try {
      const data = await this._customerRepository.findOne({
        where: { customer_id: customer_id },
      });

      if (data) {
        const customer = new CustomerDTO();

        customer.customer_id = data.customer_id;
        customer.cifid = data.cifid;
        customer.first_name = data.first_name;
        customer.last_name = data.last_name;
        customer.email = data.email;
        customer.phone_country_code = data.phone_country_code;
        customer.phone_number = data.phone_number;
        customer.role = data.role;
        customer.status = data.status;
        customer.dob = data.dob;
        customer.last_login = data.last_login;
        customer.created_at = data.created_at;
        customer.updated_at = data.updated_at;
        customer.updated_by = data.updated_by;
        return customer;
      } else {
        return null;
      }
    } catch (err) {
      Logger.error('Unable to fetch customer details', err);
      throw new InternalServerErrorException(
        'Unable to fetch customer details ',
      );
    }
  }
}
