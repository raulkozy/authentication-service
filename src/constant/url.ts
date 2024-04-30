export const CUSTOMER_SERVICE_URL = () => process.env.CUSTOMER_SERVICE_URL;
export const ADMIN_SERVICE_URL = () => process.env.ADMIN_SERVICE_URL;

//Customer service
export const LOGIN_PROFILE_API_URL = () =>
  `${CUSTOMER_SERVICE_URL()}/customer/v2/login-profile`;
export const LOGIN_PROFILE_STATUS_API_URL = () =>
  `${CUSTOMER_SERVICE_URL()}/customer/v2/status`;
export const UPDATE_CUSTOMER_LAST_LOGIN_API_URL = () =>
  `${CUSTOMER_SERVICE_URL()}/customer/v2/last-login`;

//Admin service
export const LOGIN_PROFILE_STATUS_API_ADMIN_URL = () =>
  `${ADMIN_SERVICE_URL()}/user/status`;
export const LOGIN_PROFILE_API_ADMIN_URL = () =>
  `${ADMIN_SERVICE_URL()}/user/login-profile`;
export const UPDATE_CUSTOMER_LAST_LOGIN_API_ADMIN_URL = () =>
  `${ADMIN_SERVICE_URL()}/user/last-login`;

// Veridium
export const GET_VERIDIUM_AUTH_TOKEN = '/v1.0/veridium/auth/:profileExternalId';
export const GET_VERIDIUM_SESSION_STATUS = '/v1.0/veridium/status/:sessionId';

export const AUTH_MS_URL = () => process.env.AUTH_MS_URL;
export const CURRENCY_MS_URL = () => process.env.CURRENCY_MS_URL;
export const NOTIFICATION_MS_URL = () => process.env.NOTIFICATION_MS_URL;

//stepup
export const VERIDIUM_CREATE_SESSION_API_URL = (customerID) =>
  `${AUTH_MS_URL()}/v1.0/veridium/auth/${customerID}`;
export const VERIDIUM_CHECK_SESSION_API_URL = (sessionId) =>
  `${AUTH_MS_URL()}/v1.0/veridium/status/${sessionId}`;
