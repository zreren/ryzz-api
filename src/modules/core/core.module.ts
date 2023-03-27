import { BullModule } from '@nestjs/bullmq';
import { ModuleMetadata } from '@nestjs/common';
import { ElasticsearchModule, ElasticsearchModuleOptions } from '@nestjs/elasticsearch';
import { isArray, omit } from 'lodash';

import { Configure } from './configure';

import { ModuleBuilder } from './decorators';
import { RedisService } from './providers/redis.service';
import { SmsService } from './providers/sms.service';
import { SmtpService } from './providers/smtp.service';
import { QueueConfig, RedisOption, SmsConfig, SmtpConfig } from './types';

/**
 * 全局核心模块
 */
@ModuleBuilder(async (configure) => {
    let imports: ModuleMetadata['imports'] = [];
    /**
     * 添加配置实例为提供者
     */
    const providers: ModuleMetadata['providers'] = [
        {
            provide: Configure,
            useValue: configure,
        },
    ];

    const exps: ModuleMetadata['exports'] = [Configure];

    /**
     * 如果有Redis配置则添加Redis服务
     */
    if (configure.has('redis')) {
        const redisConfig = await configure.get<RedisOption[]>('redis');
        providers.push({
            provide: RedisService,
            useFactory: () => {
                const service = new RedisService(redisConfig);
                service.createClients();
                return service;
            },
        });
        exps.push(RedisService);
        /**
         * 如果有列队配置则添加列队服务
         */
        if (configure.has('queue')) {
            const queue = await configure.get<QueueConfig>('queue');
            if (isArray(queue)) {
                imports = queue.map((v) => BullModule.forRoot(v.name, omit(v, ['name'])));
            } else {
                imports.push(BullModule.forRoot(queue));
            }
        }
    }
    /**
     * 如果存在sms配置则添加SMS服务
     */
    if (configure.has('sms')) {
        const smsConfig = await configure.get<SmsConfig>('sms');
        providers.push({
            provide: SmsService,
            useFactory: () => new SmsService(smsConfig),
        });
        exps.push(SmsService);
    }
    /**
     * 如果存在smtp配置则添加STMP服务
     */
    if (configure.has('smtp')) {
        const smtpConfig = await configure.get<SmtpConfig>('smtp');
        providers.push({
            provide: SmtpService,
            useFactory: () => new SmtpService(smtpConfig),
        });
        exps.push(SmtpService);
    }
    /**
     * 如果存在es配置则提交Elasticsearch服务
     */
    if (configure.has('es')) {
        const esConfig = await configure.get<ElasticsearchModuleOptions>('es');
        imports.push(ElasticsearchModule.register(esConfig));
        exps.push(ElasticsearchModule);
    }
    return {
        global: true,
        imports,
        providers,
        exports: exps,
    };
})
export class CoreModule {}
