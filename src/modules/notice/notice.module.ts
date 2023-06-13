import { ModuleBuilder } from '../core/decorators';
import { addEntities } from '../database/helpers';

import { NoticeEntity } from './entities/notice.entity';

import { NoticeListener } from './notice.listener';

import { NoticeService } from './notice.service';

@ModuleBuilder(async (configure) => {
    return {
        imports: [addEntities(configure, [NoticeEntity])],
        providers: [NoticeService, NoticeListener],
        exports: [NoticeService],
    };
})
export class NoticeModule {}
