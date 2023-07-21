import { Injectable } from '@nestjs/common';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { isNil } from 'lodash';

import { In } from 'typeorm';

import { UserEntity } from '@/modules/user/entities';

import { UserRepository } from '@/modules/user/repositories';

import { CommentEntity, CommentLikeEntity, PostEntity, PostLikeEntity } from '../entities';
import {
    CancelCommentLikeEvent,
    CancelPostLikeEvent,
    CommentLikeEvent,
    PostLikeEvent,
} from '../events';
import { PostRepository } from '../repositories';

/**
 * 点赞
 */
@Injectable()
export class LikeService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly postRepository: PostRepository,
        protected readonly eventEmitter?: EventEmitter2,
    ) {}

    /**
     * 点赞
     * @param user 用户
     * @param post_id 帖子ID
     */
    async like(user: UserEntity, post_id: string) {
        const post = await PostEntity.findOne({ where: { id: post_id }, relations: ['user'] });
        if (isNil(post)) {
            return;
        }
        const now = new Date();
        const result = await PostLikeEntity.createQueryBuilder(PostLikeEntity.name)
            .insert()
            .orIgnore()
            .updateEntity(false)
            .values({
                user,
                post,
                createdAt: now,
            })
            .execute();

        if (result.raw.affectedRows === 1) {
            this.eventEmitter.emit(
                'post.like',
                new PostLikeEvent({
                    post_id: post.id,
                    user_id: user.id,
                    target_user_id: post.user.id,
                    created_at: now,
                }),
            );
        }
    }

    /**
     * 取消点赞
     * @param userId 用户ID
     * @param postId 帖子ID
     */
    async cancelLike(userId: string, postId: string) {
        const result = await PostLikeEntity.createQueryBuilder(PostLikeEntity.name)
            .where('userId = :userId AND postId = :postId', { userId, postId })
            .delete()
            .execute();
        if (result.affected === 1) {
            this.eventEmitter.emit(
                'post.cancelLike',
                new CancelPostLikeEvent({
                    post_id: postId,
                    user_id: userId,
                }),
            );
        }
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

    /**
     * 筛选用户点赞过的帖子ID列表
     * @param userId
     * @param postIds
     */
    async getUserLikedPostIds(userId: string, postIds: string[]): Promise<string[]> {
        return (
            await PostLikeEntity.createQueryBuilder(PostLikeEntity.name)
                .where('userId = :userId', { userId })
                .andWhere('postId IN (:...postIds)', { postIds })
                .select(['postId'])
                .getRawMany()
        ).map((v) => v.postId);
    }

    /**
     * 点赞评论
     * @param user 用户
     * @param post_id 帖子ID
     */
    async likeComment(user: UserEntity, commentId: string) {
        const comment = await CommentEntity.findOne({
            where: { id: commentId },
            relations: ['user'],
        });
        if (isNil(comment)) {
            return;
        }
        const now = new Date();
        const result = await CommentLikeEntity.createQueryBuilder(CommentLikeEntity.name)
            .insert()
            .orIgnore()
            .updateEntity(false)
            .values({
                user,
                comment,
                createdAt: now,
            })
            .execute();

        if (result.raw.affectedRows === 1) {
            this.eventEmitter.emit(
                'comment.like',
                new CommentLikeEvent({
                    comment_id: comment.id,
                    user_id: user.id,
                    target_user_id: comment.user.id,
                    created_at: now,
                }),
            );
        }
    }

    /**
     * 取消点赞评论
     * @param userId 用户ID
     * @param postId 帖子ID
     */
    async cancelLikeComment(userId: string, commentId: string) {
        const result = await CommentLikeEntity.createQueryBuilder(CommentLikeEntity.name)
            .where('userId = :userId AND commentId = :commentId', { userId, commentId })
            .delete()
            .execute();

        if (result.affected === 1) {
            this.eventEmitter.emit(
                'comment.cancelLike',
                new CancelCommentLikeEvent({
                    comment_id: commentId,
                    user_id: userId,
                }),
            );
        }
    }

    /**
     * 筛选用户点赞过的评论ID列表
     * @param userId
     * @param commentIds
     */
    async getUserLikedCommentIds(userId: string, commentIds: string[]): Promise<string[]> {
        return (
            await CommentLikeEntity.createQueryBuilder(CommentLikeEntity.name)
                .where('userId = :userId', { userId })
                .andWhere('commentId IN (:...commentIds)', { commentIds })
                .select(['commentId'])
                .getRawMany()
        ).map((v) => v.commentId);
    }
}
