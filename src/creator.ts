import { NestFactory } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { createApp } from '@/modules/core/helpers/app';

import * as configs from './config';

import { ContentModule } from './modules/content/content.module';
import { MediaModule } from './modules/media/media.module';
import { RbacGuard } from './modules/rbac/guards';
import { RbacModule } from './modules/rbac/rbac.module';
import { UserModule } from './modules/user/user.module';

export const creator = createApp({
    configs,
    configure: { storage: true },
    modules: [
        ContentModule,
        RbacModule,
        UserModule,
        MediaModule,
        EventEmitterModule.forRoot({
            // set this to `true` to use wildcards
            wildcard: true,
            // the delimiter used to segment namespaces
            delimiter: '.',
            // set this to `true` if you want to emit the newListener event
            newListener: false,
            // set this to `true` if you want to emit the removeListener event
            removeListener: false,
            // the maximum amount of listeners that can be assigned to an event
            maxListeners: 10,
            // show event name in memory leak message when more than maximum amount of listeners is assigned
            verboseMemoryLeak: false,
            // disable throwing uncaughtException if an error event is emitted and it has no listeners
            ignoreErrors: false,
        }),
    ],
    builder: async ({ configure, BootModule }) => {
        return NestFactory.create<NestFastifyApplication>(BootModule, new FastifyAdapter(), {
            cors: true,
            logger: ['error', 'warn'],
        });
    },
    globals: { guard: RbacGuard },
});
