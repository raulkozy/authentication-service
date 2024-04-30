import { CustomerRoleEnum, CustomerStatusEnum } from './customer.enum';

export class CustomerDTO {
  /** Unique identification number of the customer */
  id?: number;

  customer_id?: string;

  cifid?: string;

  //personal

  /** First name of the customer */
  first_name?: string;

  /** Last name of the customer */
  last_name?: string;

  /** Avatar of the customer */
  avatar_url?: string;

  /** Email of the customer */
  email?: string;

  /** Role of the customer: Invitee, Customer */
  role?: CustomerRoleEnum;

  /** Primary phone country code of the customer */
  phone_country_code?: string;

  /** Primary phone of the customer */
  phone_number?: string;

  /** Date of Birth of the customer */
  dob?: Date;

  /** Status of the customer account */
  status?: CustomerStatusEnum;

  /** Last login time of the customer account */
  last_login?: Date;

  //system
  /** Created time of the customer account */
  created_at?: Date;

  /** Updated time of the customer account */
  updated_at?: Date;

  /** Creator of the customer account */
  created_by?: number;

  /** Updater of the customer account */
  updated_by?: number;
}
