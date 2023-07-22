import { ForbiddenException, Injectable } from '@nestjs/common';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { isNil } from 'lodash';

import { EntityNotFoundError, SelectQueryBuilder } from 'typeorm';

import { BaseService } from '@/modules/database/base';

import { UserEntity } from '@/modules/user/entities';

import { CreateCommentDto, QueryCommentDto, QueryCommentTreeDto } from '../dtos';
import { CommentEntity } from '../entities/comment.entity';
import { CommentPublishedEvent } from '../events/commentPublished.event';
import { CommentRepository } from '../repositories/comment.repository';
import { PostRepository } from '../repositories/post.repository';

import { LikeService } from './like.service';

/**
 * 评论数据操作
 */
@Injectable()
export class CommentService extends BaseService<CommentEntity, CommentRepository> {
    constructor(
        protected repository: CommentRepository,
        protected postRepository: PostRepository,
        private readonly eventEmitter: EventEmitter2,
        private readonly jwtService: JwtService,
        private readonly likeService: LikeService,
    ) {
        super(repository);
    }

    /**
     * 直接查询评论树
     * @param options
     */
    async findTrees(options: QueryCommentTreeDto = {}, requestToken = '') {
        const comments = await this.repository.findTrees({
            addQuery: async (qb) => {
                return isNil(options.post) ? qb : qb.where('post.id = :id', { id: options.post });
            },
        });

        // 登录用户
        if (comments.length > 0 && !isNil(requestToken)) {
            const { sub } = this.jwtService.decode(requestToken);
            if (!isNil(sub)) {
                const flatTrees = await this.repository.toFlatTrees(comments);
                const commentIds = flatTrees.map((v: CommentEntity) => v.id);
                const likedCommentIds = await this.likeService.getUserLikedCommentIds(
                    sub,
                    commentIds,
                );
                if (likedCommentIds.length > 0) {
                    return this.repository.toTrees(
                        flatTrees.map((v: CommentEntity) => {
                            v.isLiked = likedCommentIds.includes(v.id);
                            return v;
                        }),
                    );
                }
            }
        }
        return comments;
    }

    /**
     * 查找一篇文章的评论并分页
     * @param dto
     */
    async paginate(options: QueryCommentDto) {
        const { post } = options;
        const addQuery = async (qb: SelectQueryBuilder<CommentEntity>) => {
            const condition: Record<string, string> = {};
            if (!isNil(post)) condition.post = post;
            return Object.keys(condition).length > 0 ? qb.andWhere(condition) : qb;
        };
        return super.paginate({
            ...options,
            addQuery,
        });
    }

    /**
     * 新增评论
     * @param data
     * @param user
     */
    async create(data: CreateCommentDto, user: UserEntity) {
        const parent = await this.getParent(undefined, data.parent);
        if (!isNil(parent) && parent.post.id !== data.post) {
            throw new ForbiddenException('Parent comment and child comment must belong same post!');
        }
        const post = await this.getPost(data.post);
        const item = await this.repository.save({
            ...data,
            parent,
            post,
            user,
        });

        this.eventEmitter.emit(
            'comment.published',
            new CommentPublishedEvent({
                comment_id: item.id,
                user_id: user.id,
                target_user_id: post.user.id,
            }),
        );
        return this.repository.findOneOrFail({ where: { id: item.id } });
    }

    /**
     * 获取评论所属文章实例
     * @param id
     */
    protected async getPost(id: string) {
        return !isNil(id)
            ? this.postRepository.findOneOrFail({ where: { id }, relations: ['user'] })
            : id;
    }

    /**
     * 获取请求传入的父分类
     * @param current 当前分类的ID
     * @param id
     */
    protected async getParent(current?: string, id?: string) {
        if (current === id) return undefined;
        let parent: CommentEntity | undefined;
        if (id !== undefined) {
            if (id === null) return null;
            parent = await this.repository.findOne({
                relations: ['parent', 'post'],
                where: { id },
            });
            if (!parent) {
                throw new EntityNotFoundError(CommentEntity, `Parent comment ${id} not exists!`);
            }
        }
        return parent;
    }
}
