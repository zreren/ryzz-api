import { ModuleMetadata } from '@nestjs/common';

import { ModuleBuilder } from '../core/decorators';

import { addEntities } from '../database/helpers';
import { TokenService } from '../user/services';

import { ChatMessageEntity } from './entities/message.entity';
import { EventGateway } from './event.gateway';
import { WsService } from './ws.service';

@ModuleBuilder(async (configure) => {
    const providers = [];
    providers.push(TokenService, WsService);
    if (!(await configure.get<boolean>('cli', true))) {
        providers.push(EventGateway);
    }
    return {
        imports: [addEntities(configure, [ChatMessageEntity])],
        providers,
        exports: [WsService],
    } as ModuleMetadata;
})
export class WsModule {}
