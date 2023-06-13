import { ModuleMetadata } from '@nestjs/common';

import { ModuleBuilder } from '../core/decorators';

import { EventGateway } from './event.gateway';
import { TokenService } from '../user/services';
import { WsService } from './ws.service';

@ModuleBuilder(async (configure) => {
    const providers = [];
    providers.push(TokenService, WsService);
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
