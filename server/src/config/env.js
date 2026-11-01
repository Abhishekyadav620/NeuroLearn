import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env and root fallback
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const resolvedEnv = process.env.NODE_ENV || 'development';

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: resolvedEnv,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/neurolearn',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'neurolearn_dev_fallback_secret_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10,
  IS_PRODUCTION: resolvedEnv === 'production',
  IS_DEVELOPMENT: resolvedEnv === 'development',
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
