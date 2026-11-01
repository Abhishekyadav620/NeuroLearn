import morgan from 'morgan';
import { ENV } from '../config/env.js';

// Setup Morgan logging format depending on environment
export const requestLogger = morgan(ENV.IS_PRODUCTION ? 'combined' : 'dev');
