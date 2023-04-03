import { Injectable } from '@nestjs/common';

import { isNil } from 'lodash';

import { In } from 'typeorm';

import { UserEntity } from '@/modules/user/entities';

import { UserRepository } from '@/modules/user/repositories';

import { PostEntity, PostLikeEntity } from '../entities';
import { PostRepository } from '../repositories';

/**
 * 点赞
 */
@Injectable()
export class LikeService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly postRepository: PostRepository,
    ) {}

    /**
     * 点赞
     * @param user 用户
     * @param post_id 帖子ID
     */
    async like(user: UserEntity, post_id: string) {
        const post = await PostEntity.findOneBy({ id: post_id });
        if (isNil(post)) {
            return;
        }
        PostLikeEntity.createQueryBuilder(PostLikeEntity.name)
            .insert()
            .orIgnore()
            .updateEntity(false)
            .values({
                user,
                post,
            })
            .execute();
    }

    /**
     * 取消点赞
     * @param userId 用户ID
     * @param postId 帖子ID
     */
    async cancelLike(userId: string, postId: string) {
        PostLikeEntity.createQueryBuilder(PostLikeEntity.name)
            .where('userId = :userId AND postId = :postId', { userId, postId })
            .delete()
            .execute();
    }

    /**
     * 获取帖子点赞的用户列表
     * @param postId 帖子ID
     * @param page 页码
     * @param limit 数量
     */
    async getLikeUsers(postId: string, page = 1, limit = 10) {
        const postLikes = await PostLikeEntity.createQueryBuilder(PostLikeEntity.name)
            .where('postId = :postId', { postId })
            .select(['userId'])
            .orderBy('id', 'DESC')
            .offset((page - 1) * limit)
            .take(limit)
            .execute();
        if (isNil(postLikes)) {
            return [];
        }
        const userIds = postLikes.map((item: any) => {
            return item.userId;
        });
        return this.userRepository.find({
            where: { id: In(userIds) },
            select: ['id', 'nickname', 'avatar'],
        });
    }

    /**
     * 获取用户的点赞帖子列表
     * @param userId 用户ID
     * @param page 页码
     * @param limit 数量
     */
    async getLikePosts(userId: string, page = 1, limit = 10) {
        const postLikes = await PostLikeEntity.createQueryBuilder(PostLikeEntity.name)
            .where('userId = :userId', { userId })
            .select(['postId'])
            .orderBy('id', 'DESC')
            .offset((page - 1) * limit)
            .take(limit)
            .execute();
        if (isNil(postLikes)) {
            return [];
        }
        const postIds = postLikes.map((item: any) => {
            return item.postId;
        });
        return this.postRepository.find({
            where: { id: In(postIds) },
        });
    }
}
