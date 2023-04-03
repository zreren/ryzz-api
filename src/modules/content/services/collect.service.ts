import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';

import { BaseService } from '@/modules/database/base';

import { CreateCollectDto, UpdateCollectDto } from '../dtos';
import { CollectEntity } from '../entities';

import { CollectRepository } from '../repositories';

/**
 * 分类数据操作
 */
@Injectable()
export class CollectService extends BaseService<CollectEntity, CollectRepository> {
    constructor(protected repository: CollectRepository) {
        super(repository);
    }

    /**
     * 新增分类
     * @param data
     */
    async create(data: CreateCollectDto) {
        const item = await this.repository.save({
            ...data,
        });
        return this.detail(item.id);
    }

    /**
     * 更新分类
     * @param data
     */
    async update(data: UpdateCollectDto) {
        const querySet = omit(data, ['id']);
        if (Object.keys(querySet).length > 0) {
            await this.repository.update(data.id, querySet);
        }
        const cat = await this.detail(data.id);
        return cat;
    }
}
