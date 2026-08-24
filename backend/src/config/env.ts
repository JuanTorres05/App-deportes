import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || '4000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://playconnect_user:playconnect_password@localhost:5432/playconnect_db?schema=public',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default-access-secret-key-replace-in-prod',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key-replace-in-prod',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
