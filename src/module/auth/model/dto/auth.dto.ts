import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CustomerStatusEnum, VerificationStatusEnum } from '../enum';

export class TokenDTO {
  /** Token type */
  token_type: string;

  /** Token expiry */
  expires_in: string;

  /** Refresh token expiry */
  refresh_expires_in: string;

  /** Access token */
  access_token: string;

  /** Refresh Token */
  refresh_token: string;

  /** Token scope */
  scope: string;

  /** Customer basic information */
  user_data?: any;
}

export class LoginDTO {
  /** Username or email */
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  /** password */
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @ApiProperty()
  force = false;
}

//Customer
export class CustomerTokenDTO {
  id?: number;
  customer_id?: string;
  cifid?: string;
  first_name?: string;
  last_name?: string;
  preferred_language?: string;
  preferred_currency?: string;
  email?: string;
  role?: string;
  age?: number;
  status?: CustomerStatusEnum;
  last_login?: Date;
  refresh_token_code?: string;
}

export class CustomerDTO {
  /** Unique identification number of the customer */
  id?: number;

  customer_id?: string;

  verification?: VerificationDTO;

  /** First name of the customer */
  first_name?: string;

  /** Last name of the customer */
  last_name?: string;

  /** Avatar of the customer */
  avatar_url?: string;

  /** Langauge Preference of the customer */
  preferred_language?: string;

  /** Currency Preference of the customer */
  preferred_currency?: string;

  /** Email of the customer */
  email?: string;

  /** Role of the customer: Invitee, Customer */
  role?: string;

  /** Age of the customer */
  age?: number;

  /** Status of the customer account */
  status?: string;

  /** Last login time of the customer account */
  last_login?: Date;

  /** Created time of the customer account */
  created_at?: Date;

  /** Updated time of the customer account */
  updated_at?: Date;
}

export class VerificationDTO {
  id?: string;

  cvs_id?: string;

  name_verified?: VerificationStatusEnum;

  phone_verified?: VerificationStatusEnum;

  email_verified?: VerificationStatusEnum;

  address_verified?: VerificationStatusEnum;

  customer?: number;
}

//Admin User
export class AdminUserTokenDTO {
  id?: number;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  status?: CustomerStatusEnum;
  last_login?: Date;
  refresh_token_code?: string;
}

export class AdminUserDTO {
  /** Unique identification number of the customer */
  id?: number;

  user_id?: string;

  /** First name of the customer */
  first_name?: string;

  /** Last name of the customer */
  last_name?: string;

  /** Email of the customer */
  email?: string;

  /** Role of the customer: Invitee, Customer */
  role?: string;

  /** Status of the customer account */
  status?: string;

  /** Last login time of the customer account */
  last_login?: Date;

  /** Created time of the customer account */
  created_at?: Date;

  /** Updated time of the customer account */
  updated_at?: Date;
}
