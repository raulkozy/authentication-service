export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    name: process.env.DATABASE_NAME || 'admin_service',
    host: process.env.DATABASE_HOST || '0.0.0.0',
    sid: process.env.DATABASE_SID || 'ORCL',
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  },
  jwt: {
    JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
    JWT_ISS: process.env.JWT_ISS,
  },
});

export interface DatabaseConfig {
  name: string;
  host: string;
  port: number;
  sid: string;
  username: string;
  password: string;
}

export interface JWTConfig {
  JWT_PUBLIC_KEY: string;
  JWT_PRIVATE_KEY: string;
  JWT_ISS: string;
}
