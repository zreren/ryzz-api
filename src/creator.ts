import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { WinstonModule } from 'nest-winston';

import { createApp } from '@/modules/core/helpers/app';

import * as configs from './config';

import { ContentModule } from './modules/content/content.module';
import { WinstonConfig } from './modules/core/types';
import { MediaModule } from './modules/media/media.module';
import { RbacGuard } from './modules/rbac/guards';
import { RbacModule } from './modules/rbac/rbac.module';
import { UserModule } from './modules/user/user.module';

export const creator = createApp({
    configs,
    configure: { storage: true },
    modules: [ContentModule, RbacModule, UserModule, MediaModule],
    builder: async ({ configure, BootModule }) => {
        return NestFactory.create<NestFastifyApplication>(BootModule, new FastifyAdapter(), {
            cors: true,
            logger: configure.has('winstonLogger')
                ? WinstonModule.createLogger(await configure.get<WinstonConfig>('winstonLogger'))
                : ['error', 'warn'],
        });
    },
    globals: { guard: RbacGuard },
});
