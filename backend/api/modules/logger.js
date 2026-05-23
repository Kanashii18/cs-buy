import winston from 'winston';

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
})

export default function ( service ) {
     return{
          log: ( message, option = "info" ) => {
               logger.log(option, { service, message });
          }
     }
};