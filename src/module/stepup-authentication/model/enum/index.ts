export enum CheckStatusEnum {
  pass = 'pass',
  fail = 'fail',
}

export enum ChannelEnum {
  MOB = 'MOB',
  WEB = 'WEB',
}

export enum StepupRuleEnum {
  geoLocationCheck = 'geoLocationCheck',
  firstLoginAfterUnlock = 'firstLoginAfterUnlock',
  addBeneficiary = 'addBeneficiary',
  firstTransactionToBeneficiary = 'firstTransactionToBeneficiary',
  transactionLimitCheck = 'transactionLimitCheck',
  randomStepupAuth = 'randomStepupAuth',
  forceStepupOnTransactionIfPreviousFaild = 'forceStepupOnTransactionIfPreviousFaild',
  transactionBetweenAccountIntervalCheck = 'transactionBetweenAccountIntervalCheck',
}

export enum ActionTypeEnum {
  login = 'login',
  addBeneficiary = 'addBeneficiary',
  transaction = 'transaction',
}

export enum StatusEnum {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum VerificationStatusEnum {
  Pending = 'Pending',
  Verified = 'Verified',
  Failed = 'Failed',
}

export enum TransactionTypeEnum {
  SELF = 'SELF',
  WITHINBANK = 'WITHINBANK',
  EXTERNALBANK = 'EXTERNALBANK',
}

export enum TransactionPurposeEnum {
  MEDICAL_EXPENSES = 'MEDICAL_EXPENSES',
  PURCHES_OF_GOODS_AND_SERVICES = 'PURCHES_OF_GOODS_AND_SERVICES',
  PAYMENY_OF_TRAVEL_EXPENDITURE = 'PAYMENY_OF_TRAVEL_EXPENDITURE',
  PURCHES_OF_REALSTATE = 'PURCHES_OF_REALSTATE',
  OTHER_PURPOSE = 'OTHER_PURPOSE',
}

export enum VerficationMethodEnum {
  PHONE = 'PHONE',
  EMAIL_OTP = 'EMAIL_OTP',
  VERIDIUM = 'VERIDIUM',
  RSA = 'RSA',
}
