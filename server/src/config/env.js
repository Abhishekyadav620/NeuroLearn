import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/neurolearn',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'neurolearn_dev_fallback_secret_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10,
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

// Validate critical configurations
export const validateEnv = () => {
  const missingConfigs = [];

  if (!process.env.PORT) {
    // Info only, default 5000 applied
  }
  if (!process.env.MONGODB_URI) {
    missingConfigs.push('MONGODB_URI (defaulting to local mongodb://127.0.0.1:27017/neurolearn)');
  }

  return {
    isValid: true,
    warnings: missingConfigs,
  };
};
