import { ModuleMetadata } from '@nestjs/common';

import { ModuleBuilder } from '../core/decorators';

import { EventGateway } from './event.gateway';
import { TokenService } from '../user/services';
import { WsService } from './ws.service';
import { addEntities } from '../database/helpers';
import { ChatMessageEntity } from './entities/message.entity';

@ModuleBuilder(async (configure) => {
    const providers = [];
    providers.push(TokenService, WsService);
    if (!(await configure.get<boolean>('cli', true))) {
        providers.push(EventGateway);
    }
    return {
        imports: [
            addEntities(configure, [ChatMessageEntity]),
        ],
        providers,
        exports: [WsService],
    } as ModuleMetadata;
})
export class WsModule {}
