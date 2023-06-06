import { ModuleMetadata } from '@nestjs/common';

import { ModuleBuilder } from '../core/decorators';

import { EventGateway } from './event.gateway';

@ModuleBuilder(async (configure) => {
    const providers = [];
    if (!(await configure.get<boolean>('cli', true))) {
        providers.push(EventGateway);
    }
    return {
        imports: [],
        providers,
        exports: [],
    } as ModuleMetadata;
})
export class WsModule {}
