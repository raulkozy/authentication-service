import { CommonHeadersDTO } from '@common/dto/headers.dto';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import {
  ActionTypeEnum,
  CheckStatusEnum,
  TransactionTypeEnum,
  VerficationMethodEnum,
} from '../enum/index';
export class StepupRequestDTO {
  @IsNotEmpty()
  action: ActionTypeEnum;

  account_number?: string;

  beneficiary_account_number?: string;

  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  transaction_type?: TransactionTypeEnum;

  amount?: number;
  currency?: string;
  session?: string;
  verification_method?: VerficationMethodEnum;
  veridium_session?: string;
  otp?: string;
}

export class StepupRequestQueryDTO {
  account_number?: string;

  beneficiary_account_number?: string;

  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  transaction_type?: TransactionTypeEnum;

  amount?: number;
  currency?: string;
}

export class StepupResponseDTO {
  session?: string;
  check: CheckStatusEnum;
  message: string;
  veridium_session?: string;
  verification_method?: VerficationMethodEnum;
}

export class CreateSessionResponseDTO {
  session: string;
  veridium_session?: string;
  verification_method: VerficationMethodEnum;
}

export class SessionTokenDTO {
  customerID: string;
  PHONE_OTP?: string;
  EMAIL_OTP?: string;
  VERIDIUM_SESSION_ID?: string;
  verification_method: VerficationMethodEnum;
}

export class StepupHeadrs extends CommonHeadersDTO {
  readonly CUSTOMER_ID?: string;
  readonly ACTION?: ActionTypeEnum;
  readonly SESSION?: string;
  readonly VERIFICATION_METHOD?: VerficationMethodEnum;
  readonly VERIDIUM_SESSION?: string;
  readonly OTP?: string;
}
