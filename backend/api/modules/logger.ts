import winston from 'winston';
import type CustomLogger from "../types/modules/logger.type.ts";
import { LogLevel } from 'fastify';
const logger = winston.createLogger({
     level: 'info',
     format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
     ),
     transports: [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' })
     ]
});


export default function (service: string): CustomLogger {
     return {
          log: (message: string, option: LogLevel) => {
               logger.log(option, { service, message });
          }
     };
}