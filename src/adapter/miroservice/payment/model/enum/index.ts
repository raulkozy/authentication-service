export enum SchedulePaymentStatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PAUSED = 'Paused',
}

export enum LastPaymentStatusEnum {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PENDING = 'PENDING',
}

export enum RepeatFrequencyEnum {
  ONE_TIME = 'ONE_TIME',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUALLY = 'ANNUALLY',
}

export enum ChannelIdEnum {
  MOB = 'MOB',
  WEB = 'WEB',
}

export enum FundTransferTypeEnum {
  SELF = 'SELF',
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export enum TransferTypeIntEnum {
  SELF = 'SELF',
  INTERNAL = 'WITHINBANK',
  EXTERNAL = 'EXTERNALBANK',
}

export enum PaymentOrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum PaymentRequestStatusEnum {
  INITIATED = 'Initiated',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled',
  SUCCESS = 'Success',
}

export enum TransactionPurposeEnum {
  MEDICAL_EXPENSES = 'MEDICAL_EXPENSES',
  PURCHES_OF_GOODS_AND_SERVICES = 'PURCHES_OF_GOODS_AND_SERVICES',
  PAYMENY_OF_TRAVEL_EXPENDITURE = 'PAYMENY_OF_TRAVEL_EXPENDITURE',
  PURCHES_OF_REALSTATE = 'PURCHES_OF_REALSTATE',
  OTHER_PURPOSE = 'OTHER_PURPOSE',
}
