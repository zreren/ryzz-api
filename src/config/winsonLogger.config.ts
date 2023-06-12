import * as winston from 'winston';
import 'winston-daily-rotate-file';

import { ConfigureRegister, WinstonConfig } from '@/modules/core/types';

export const winstonLogger: ConfigureRegister<WinstonConfig> = (configure) => ({
    transports: [
        new winston.transports.DailyRotateFile({
            dirname: `logs`, // 日志保存的目录
            filename: '%DATE%.log', // 日志名称，占位符 %DATE% 取值为 datePattern 值。
            datePattern: 'YYYY-MM-DD', // 日志轮换的频率，此处表示每天。
            zippedArchive: false, // 是否通过压缩的方式归档被轮换的日志文件。
            maxSize: '20m', // 设置日志文件的最大大小，m 表示 mb 。
            maxFiles: '60d', // 保留日志文件的最大天数，此处表示自动删除超过 60 天的日志文件。
            // 记录时添加时间戳信息
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                winston.format.errors({ stack: true }),
                winston.format.json(),
            ),
            level: 'info',
        }),
    ],
});
