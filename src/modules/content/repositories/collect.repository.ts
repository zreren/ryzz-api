import { BaseRepository } from '@/modules/database/base';
import { CustomRepository } from '@/modules/database/decorators';

import { CollectEntity } from '../entities';

@CustomRepository(CollectEntity)
export class CollectRepository extends BaseRepository<CollectEntity> {
    protected _qbName = 'collect';
}
