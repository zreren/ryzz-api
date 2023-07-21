import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isNil, omit, pick } from 'lodash';

import { BaseService } from '@/modules/database/base';

import { manualPaginateWithItems } from '@/modules/database/helpers';

import { QueryHook, PaginateReturn } from '@/modules/database/types';

import { CreateCollectDto, QueryCollectDto, QueryCollectPostDto, UpdateCollectDto } from '../dtos';
import { CollectEntity, CollectPostEntity } from '../entities';

import { CollectRepository } from '../repositories';

import { LikeService } from './like.service';

/**
 * 收藏夹数据操作
 */
@Injectable()
export class CollectService extends BaseService<CollectEntity, CollectRepository> {
    constructor(
        protected repository: CollectRepository,
        private readonly jwtService: JwtService,
        private readonly likeService: LikeService,
    ) {
        super(repository);
    }

    async paginate(
        options?: QueryCollectDto,
        callback?: QueryHook<CollectEntity>,
    ): Promise<PaginateReturn<CollectEntity>> {
        const query = CollectEntity.createQueryBuilder('collect')
            .orderBy('id', 'DESC')
            .skip((options.page - 1) * options.limit)
            .take(options.limit);
        if (!isNil(options.user)) {
            query.where('userId = :userId', { userId: options.user });
        }
        const data = await query.getManyAndCount();
        return manualPaginateWithItems(pick(options, 'page', 'limit'), data[0], data[1]);
    }

    /**
     * 新增收藏夹
     * @param data
     */
    async create(data: CreateCollectDto) {
        const item = await this.repository.save({
            ...data,
        });
        return this.detail(item.id);
    }

    /**
     * 更新收藏夹
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

    async getPosts(options: QueryCollectPostDto, requestToken = '') {
        const query = CollectPostEntity.createQueryBuilder('collect_post')
            .leftJoinAndSelect('collect_post.post', 'post')
            .leftJoinAndSelect('collect_post.collect', 'collect')
            .leftJoinAndSelect('post.user', 'user')
            .orderBy('collect_post.createdAt', 'DESC')
            .skip((options.page - 1) * options.limit)
            .take(options.limit);
        if (!isNil(options.collect)) {
            query.where('collect_post.collectId = :collect', { collect: options.collect });
        }
        const data = await query.getManyAndCount();

        const { sub } = this.jwtService.decode(requestToken);
        let posts = data[0];
        if (sub && posts.length > 0) {
            const likedPostIds = await this.likeService.getUserLikedPostIds(
                sub,
                posts.map((v: CollectPostEntity) => v.post.id),
            );
            if (likedPostIds.length > 0) {
                posts = posts.map((v: CollectPostEntity) => {
                    v.post.isLiked = likedPostIds.includes(v.post.id);
                    return v;
                });
            }
        }

        return manualPaginateWithItems(pick(options, 'page', 'limit'), posts, data[1]);
    }
}
