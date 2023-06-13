import { createConnectionOptions } from '@/modules/core/helpers';
import { ConfigureFactory, RedisConfig, RedisConfigOptions } from '@/modules/core/types';

export const redis: ConfigureFactory<RedisConfigOptions, RedisConfig> = {
    register: () => ({
        host: process.env.REDIS_HOST ? process.env.REDIS_HOST : 'localhost',
        port: process.env.REDIS_POST ? parseInt(process.env.REDIS_POST, 10) : 6379,
        password: process.env.REDIS_PASSWORD ? process.env.REDIS_PASSWORD : '',
    }),
    hook: (configure, value) => createConnectionOptions(value),
};
