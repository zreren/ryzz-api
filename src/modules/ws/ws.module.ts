import { ModuleMetadata } from '@nestjs/common';

import { ModuleBuilder } from '../core/decorators';

import { EventGateway } from './event.gateway';

@ModuleBuilder(
    async (configure) =>
        ({
            imports: [],
            providers: [EventGateway],
            exports: [],
        } as ModuleMetadata),
)
export class WsModule {}
