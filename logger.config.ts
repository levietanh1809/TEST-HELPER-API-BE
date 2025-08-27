import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

export function createWinstonConfig(): WinstonModuleOptions {
  return {
    transports: [
      // Ghi log ra console
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          nestWinstonModuleUtilities.format.nestLike(),
        ),
      }),
      // Ghi log ra file
      new winston.transports.File({
        filename: path.join(__dirname, '../logs/app.log'),
        level: 'info', // chỉ ghi từ mức info trở lên
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.json(),
        ),
      }),
      // Ghi log lỗi riêng vào file error.log
      new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.json(),
        ),
      }),
    ],
  };
}
