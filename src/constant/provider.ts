import { SetMetadata } from '@nestjs/common';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';
export const PASSWORD_REPOSITORY = 'PASSWORD_REPOSITORY';
export const REFRESH_TOKEN_REPOSITORY = 'REFRESH_TOKEN_REPOSITORY';
export const USER_LOGIN_REPOSITORY = 'USER_LOGIN_REPOSITORY';
export const STEPUP_SESSION_REPOSITORY = 'STEPUP_SESSION_REPOSITORY';

export const VERIDIUM_PASSPHRASE = () => process.env.VERIDIUM_PASSPHRASE;
export const PROVIDER_KEY = () => process.env.PROVIDER_KEY;
export const PROVIDER_CERT = () => process.env.PROVIDER_CERT;

//Step up auth
export const JWT_STEPUP_AUTH_VERIFICATION_SECRET = () =>
  process.env.JWT_STEPUP_AUTH_VERIFICATION_SECRET;
export const JWT_STEPUP_AUTH_VERIFICATION_TOKEN_EXPIRES_TIME = () =>
  process.env.JWT_STEPUP_AUTH_VERIFICATION_TOKEN_EXPIRES_TIME;
export const STEPUP_PHONE_OTP_VERIFICATION_TEMPLATE_CODE = () =>
  process.env.STEPUP_PHONE_OTP_VERIFICATION_TEMPLATE_CODE;
export const STEPUP_EMAIL_OTP_VERIFICATION_TEMPLATE_CODE = () =>
  process.env.STEPUP_EMAIL_OTP_VERIFICATION_TEMPLATE_CODE;

//auth
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
