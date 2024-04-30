export const JWT_TOKEN_EXPIRES_TIME = () => process.env.JWT_TOKEN_EXPIRES_TIME;
export const JWT_REFRESH_TOKEN_EXPIRES_TIME = () =>
  process.env.JWT_REFRESH_TOKEN_EXPIRES_TIME;
export const JWT_PUBLIC_KEY = () =>
  process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
export const JWT_ISS = () => process.env.JWT_ISS;
