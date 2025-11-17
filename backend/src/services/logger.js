import winston from 'winston';

const transports = [];

// In production serverless environments (like Vercel) writing to disk
// may be restricted. Enable file transports only when explicitly allowed.
if (process.env.ENABLE_FILE_LOGS === 'true') {
  transports.push(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
  transports.push(new winston.transports.File({ filename: 'logs/combined.log' }));
}

// Always add a console transport so logs are visible in Vercel function logs.
transports.push(new winston.transports.Console({
  format: process.env.NODE_ENV !== 'production'
    ? winston.format.combine(winston.format.colorize(), winston.format.simple())
    : winston.format.combine(winston.format.timestamp(), winston.format.json())
}));

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'modern-business-academy' },
  transports
});

export default logger;